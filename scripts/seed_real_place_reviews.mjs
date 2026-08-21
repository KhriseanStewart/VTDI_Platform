/**
 * Google-only review sync — no curated / invented / heuristic quotes.
 * Sets places.rating from Google; review_count = stored Google snippets only.
 *
 * Usage: bun scripts/seed_real_place_reviews.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import postgres from 'postgres'

import { inJamaica, JAMAICA_CENTER, loadEnv } from './lib/seed-env.mjs'

loadEnv()

const mapsKey = process.env.VITE_GOOGLE_MAPS_API_KEY
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const VENUES = [
  { id: 'devon-house', placeId: 'ChIJmcJS9v4-244RZETPkJh7xY0', query: 'Devon House I-Scream Kingston' },
  { id: 'hellshire-beach', placeId: 'ChIJ0yP6tMJr244RwI2-NUX25tM', query: 'Hellshire Beach Jamaica' },
  { id: 'red-bones', placeId: 'ChIJoaDg6Kk_244RVXV35_mpcHU', query: 'Redbones Blues Cafe Kingston' },
  { id: 'sugarcane-rooftop', placeId: 'ChIJU4ulfgA_244Rsw-Fc8amsDM', query: 'Mezza Luna Rooftop Kingston' },
  { id: 'miss-t', placeId: 'ChIJ8ew4p_8-244RqEG8z9SM2xo', query: 'Chilitos Jamexican Kingston' },
  { id: 'tracks-records', placeId: 'ChIJI1Fzg0s-244R_tp6kNAgyGA', query: "Usain Bolt's Tracks & Records Kingston" },
  { id: 'level-up-gaming', query: 'Treasure Hunt Gaming Lounge Kingston Trinidad Terrace' },
  { id: 'bob-marley-museum', query: 'Bob Marley Museum Kingston Jamaica' },
  { id: 'hope-botanical', query: 'Hope Botanical Gardens Kingston Jamaica' },
  { id: 'gloria-seafood', query: "Gloria's Seafood Restaurant Port Royal Jamaica" },
  { id: 'deaf-can-coffee', query: 'Deaf Can Coffee Kingston Jamaica Barbados Avenue' },
  { id: 'palace-cineplex', query: 'Palace Cineplex Sovereign Centre Kingston' },
  { id: 'starbucks-hwt', query: 'Starbucks Half Way Tree Kingston Jamaica' },
  { id: 'ricks-cafe', query: "Rick's Cafe Negril Jamaica" },
  { id: 'dunn-river-falls', query: "Dunn's River Falls Ocho Rios Jamaica" },
  { id: 'doctors-cave-beach', query: "Doctor's Cave Beach Montego Bay" },
  { id: 'rose-hall', query: 'Rose Hall Great House Montego Bay' },
  { id: 'mystic-mountain', query: 'Mystic Mountain Ocho Rios Jamaica' },
  { id: 'frenchmans-cove', query: "Frenchman's Cove Beach Port Antonio" },
  { id: 'ys-falls', query: 'YS Falls St Elizabeth Jamaica' },
  { id: 'floyds-pelican-bar', query: "Floyd's Pelican Bar Jamaica" },
  { id: 'appleton-estate', query: 'Appleton Estate Rum Tour Jamaica' },
  { id: 'emancipation-park', query: 'Emancipation Park Kingston Jamaica' },
  { id: 'scotchies-mobay', query: 'Scotchies Jerk Centre Montego Bay' },
  { id: 'margaritaville-mobay', query: 'Margaritaville Montego Bay Jamaica' },
  { id: 'luminous-lagoon', query: 'Luminous Lagoon Falmouth Jamaica' },
  { id: 'boston-jerk', query: 'Boston Jerk Centre Portland Jamaica' },
]

async function textSearch(query) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
  url.searchParams.set('query', query)
  url.searchParams.set('location', `${JAMAICA_CENTER.lat},${JAMAICA_CENTER.lng}`)
  url.searchParams.set('radius', '200000')
  url.searchParams.set('key', mapsKey)
  const json = await fetch(url).then((r) => r.json())
  if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
    throw new Error(`TextSearch ${json.status}: ${query}`)
  }
  const hit = (json.results || []).find((r) =>
    inJamaica(r.geometry.location.lat, r.geometry.location.lng),
  )
  return hit?.place_id || null
}

function reviewId(placeId, author, text) {
  const h = createHash('sha1')
    .update(`${placeId}|google|${author}|${text.slice(0, 120)}`)
    .digest('hex')
  return `rev-${h.slice(0, 12)}`
}

async function placeDetails(placeId, sort) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'name,rating,user_ratings_total,reviews')
  url.searchParams.set('reviews_sort', sort)
  url.searchParams.set('key', mapsKey)
  const json = await fetch(url).then((r) => r.json())
  if (json.status !== 'OK') throw new Error(`Details ${json.status}`)
  return json.result
}

async function applyMigrationIfNeeded() {
  if (!process.env.DATABASE_URL) return
  const sqlText = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/003_place_reviews.sql'),
    'utf8',
  )
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 1 })
  try {
    await sql.unsafe(sqlText)
    await sql.unsafe(`notify pgrst, 'reload schema'`)
  } finally {
    await sql.end({ timeout: 5 })
  }
}

async function main() {
  if (!mapsKey) {
    console.error('Missing VITE_GOOGLE_MAPS_API_KEY')
    process.exit(1)
  }

  await applyMigrationIfNeeded()

  // Wipe everything — only Google snippets go back in
  const { error: delErr } = await supabase.from('place_reviews').delete().neq('id', '')
  if (delErr) {
    console.error('Clear failed:', delErr.message)
    process.exit(1)
  }
  console.log('✓ Cleared place_reviews')

  const rows = []
  const placeStats = {}

  for (const venue of VENUES) {
    let gPlaceId = venue.placeId
    try {
      if (!gPlaceId) gPlaceId = await textSearch(venue.query)
      if (!gPlaceId) {
        console.warn(`⚠ No Google place for ${venue.id}`)
        continue
      }

      const relevant = await placeDetails(gPlaceId, 'most_relevant')
      const newest = await placeDetails(gPlaceId, 'newest')
      placeStats[venue.id] = {
        googleRating: relevant.rating ?? 0,
        googleTotal: relevant.user_ratings_total ?? 0,
        name: relevant.name,
      }

      const seen = new Set()
      for (const bundle of [relevant, newest]) {
        for (const r of bundle.reviews || []) {
          if (!r.text?.trim() || !r.author_name) continue
          const key = `${r.author_name}|${r.text.slice(0, 80)}`
          if (seen.has(key)) continue
          seen.add(key)
          rows.push({
            id: reviewId(venue.id, r.author_name, r.text),
            place_id: venue.id,
            source: 'google',
            author: r.author_name,
            avatar: r.profile_photo_url || null,
            rating: Math.min(5, Math.max(1, Number(r.rating) || 0)),
            body: r.text.trim(),
            business_reply: null,
            posted_at: r.time
              ? new Date(r.time * 1000).toISOString()
              : new Date().toISOString(),
            user_id: null,
          })
        }
      }
      console.log(
        `✓ ${venue.id}: ${seen.size} Google reviews (${relevant.rating}★ / ${relevant.user_ratings_total} on Google)`,
      )
    } catch (err) {
      console.warn(`Google ${venue.id}:`, err.message)
    }
  }

  const { error } = await supabase.from('place_reviews').upsert(rows, { onConflict: 'id' })
  if (error) {
    console.error('Upsert failed:', error.message)
    process.exit(1)
  }
  console.log(`\n✓ Upserted ${rows.length} Google reviews only`)

  for (const placeId of Object.keys(placeStats)) {
    const { count } = await supabase
      .from('place_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('place_id', placeId)
    const g = placeStats[placeId]
    await supabase
      .from('places')
      .update({
        rating: Number(g.googleRating) || 0,
        review_count: count || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', placeId)
    console.log(`  ${placeId}: ${g.googleRating}★ · ${count} listed (Google total ${g.googleTotal})`)
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
