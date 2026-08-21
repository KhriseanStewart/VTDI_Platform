/**
 * Attach real Google Places photos to island-wide venues.
 * Usage: bun scripts/seed_jamaica_island_photos.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { inJamaica, JAMAICA_CENTER, loadEnv } from './lib/seed-env.mjs'

loadEnv()

const mapsKey = process.env.VITE_GOOGLE_MAPS_API_KEY
const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

const ISLAND_VENUES = [
  { id: 'ricks-cafe', query: "Rick's Cafe Negril Jamaica" },
  { id: 'seven-mile-beach', query: 'Seven Mile Beach Negril Jamaica' },
  { id: 'kool-runnings', query: 'Kool Runnings Water Park Negril' },
  { id: 'the-cliff-negril', query: 'The Cliff Restaurant Negril Jamaica' },
  { id: 'scotchies-negril', query: 'Scotchies Jerk Centre Negril' },
  { id: 'doctors-cave-beach', query: "Doctor's Cave Beach Montego Bay" },
  { id: 'rose-hall', query: 'Rose Hall Great House Montego Bay' },
  { id: 'margaritaville-mobay', query: 'Margaritaville Montego Bay Jamaica' },
  { id: 'scotchies-mobay', query: 'Scotchies Jerk Centre Montego Bay' },
  { id: 'pier-one-mobay', query: 'Pier 1 Montego Bay Jamaica' },
  { id: 'dunn-river-falls', query: "Dunn's River Falls Ocho Rios Jamaica" },
  { id: 'mystic-mountain', query: 'Mystic Mountain Ocho Rios Jamaica' },
  { id: 'dolphin-cove-ochi', query: 'Dolphin Cove Ocho Rios Jamaica' },
  { id: 'scotchies-ochi', query: 'Scotchies Jerk Centre Ocho Rios' },
  { id: 'turtle-river-falls', query: 'Turtle River Falls Ocho Rios' },
  { id: 'frenchmans-cove', query: "Frenchman's Cove Beach Port Antonio" },
  { id: 'blue-lagoon-portland', query: 'Blue Lagoon Port Antonio Jamaica' },
  { id: 'reach-falls', query: 'Reach Falls Portland Jamaica' },
  { id: 'boston-jerk', query: 'Boston Jerk Centre Portland Jamaica' },
  { id: 'rio-grande-rafting', query: 'Rio Grande Bamboo Rafting Port Antonio' },
  { id: 'ys-falls', query: 'YS Falls St Elizabeth Jamaica' },
  { id: 'black-river-safari', query: 'Black River Safari Jamaica' },
  { id: 'floyds-pelican-bar', query: "Floyd's Pelican Bar Jamaica" },
  { id: 'treasure-beach', query: 'Treasure Beach Jamaica' },
  { id: 'falmouth-heritage', query: 'Falmouth Historic District Jamaica' },
  { id: 'good-hope-estate', query: 'Good Hope Estate Trelawny Jamaica' },
  { id: 'appleton-estate', query: 'Appleton Estate Rum Tour Jamaica' },
  { id: 'mayfield-falls', query: 'Mayfield Falls Jamaica' },
  { id: 'blue-mountain-coffee', query: 'Blue Mountain Coffee tour Jamaica' },
  { id: 'holywell-rec', query: 'Holywell Recreation Area Blue Mountains' },
  { id: 'lime-cay', query: 'Lime Cay Kingston Jamaica' },
  { id: 'fort-charles', query: 'Fort Charles Port Royal Jamaica' },
  { id: 'emancipation-park', query: 'Emancipation Park Kingston Jamaica' },
  { id: 'national-gallery', query: 'National Gallery of Jamaica Kingston' },
  { id: 'rockhouse-negril', query: 'Rockhouse Hotel Negril Jamaica' },
  { id: 'luminous-lagoon', query: 'Luminous Lagoon Falmouth Jamaica' },
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
  if (!hit) throw new Error(`No Jamaica match for ${query}`)
  return hit.place_id
}

async function details(placeId) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'name,formatted_address,geometry,photos,rating,user_ratings_total,formatted_phone_number')
  url.searchParams.set('key', mapsKey)
  const json = await fetch(url).then((r) => r.json())
  if (json.status !== 'OK') throw new Error(`Details ${json.status}`)
  return json.result
}

async function downloadGooglePhoto(photoReference) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/photo')
  url.searchParams.set('maxwidth', '1600')
  url.searchParams.set('photo_reference', photoReference)
  url.searchParams.set('key', mapsKey)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`photo ${res.status}`)
  const type = res.headers.get('content-type') || 'image/jpeg'
  return { buf: Buffer.from(await res.arrayBuffer()), type, ext: type.includes('png') ? 'png' : 'jpg' }
}

async function upload(placeId, filename, buf, type) {
  const path = `places/${placeId}/${filename}`
  const { error } = await supabase.storage.from('media').upload(path, buf, {
    contentType: type,
    upsert: true,
    cacheControl: '86400',
  })
  if (error) throw error
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}

async function processVenue(v) {
  const gPlaceId = v.placeId || (await textSearch(v.query))
  const d = await details(gPlaceId)
  const lat = d.geometry.location.lat
  const lng = d.geometry.location.lng
  if (!inJamaica(lat, lng)) throw new Error(`Outside Jamaica: ${d.name} (${lat},${lng})`)

  const urls = []
  const photos = d.photos || []
  const take = Math.min(3, photos.length)
  for (let i = 0; i < take; i++) {
    const { buf, type, ext } = await downloadGooglePhoto(photos[i].photo_reference)
    urls.push(await upload(v.id, `place-${i}.${ext}`, buf, type))
  }
  if (!urls.length) throw new Error('No photos from Google')

  const patch = {
    image: urls[0],
    images: urls,
    address: d.formatted_address,
    lat,
    lng,
    rating: d.rating ?? 0,
    review_count: d.user_ratings_total ?? 0,
    updated_at: new Date().toISOString(),
  }
  if (d.formatted_phone_number) patch.phone = d.formatted_phone_number

  const { error } = await supabase.from('places').update(patch).eq('id', v.id)
  if (error) throw error
  return { id: v.id, googleName: d.name, count: urls.length }
}

async function main() {
  if (!mapsKey || !supabaseUrl || !serviceKey) {
    console.error('Missing env (VITE_GOOGLE_MAPS_API_KEY, Supabase keys)')
    process.exit(1)
  }
  console.log(`Syncing Google photos for ${ISLAND_VENUES.length} island places…\n`)
  let failed = 0
  for (const v of ISLAND_VENUES) {
    process.stdout.write(`→ ${v.id} … `)
    try {
      const r = await processVenue(v)
      console.log(`OK ${r.count} imgs ← ${r.googleName}`)
    } catch (err) {
      failed += 1
      console.log(`FAIL ${err.message}`)
    }
    await new Promise((r) => setTimeout(r, 300))
  }
  if (failed) process.exitCode = 1
}

main()
