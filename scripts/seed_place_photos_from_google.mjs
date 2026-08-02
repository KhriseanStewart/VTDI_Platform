/**
 * Attach real Google Places / Street View / Wikimedia photos to Kingston venues.
 * Validates locations stay in Kingston metro.
 *
 * Usage: bun scripts/seed_place_photos_from_google.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!m) continue
    let val = m[2]
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!process.env[m[1]]) process.env[m[1]] = val
  }
}

loadEnv()

const mapsKey = process.env.VITE_GOOGLE_MAPS_API_KEY
const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

const VENUES = [
  {
    id: 'devon-house',
    placeId: 'ChIJmcJS9v4-244RZETPkJh7xY0',
    name: 'Devon House I-Scream',
    neighborhood: 'Hope Road',
    area: 'Kingston',
    description:
      'Jamaica’s iconic ice cream under the verandah of the Devon House great house. Grapenut is tradition — stroll the courtyard after.',
    extraUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/8/8c/Devon_House_in_Kingson_2000.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Devon_House_ice_cream_Jamaica.jpg/1920px-Devon_House_ice_cream_Jamaica.jpg',
    ],
  },
  {
    id: 'hellshire-beach',
    placeId: 'ChIJ0yP6tMJr244RwI2-NUX25tM',
    name: 'Hellshire Beach',
    neighborhood: 'Hellshire',
    area: 'St. Catherine',
    description:
      'Kingston’s classic beach day — white sand, shallow turquoise water, and fried fish stalls. Festival, a cold drink, and no rush.',
  },
  {
    id: 'red-bones',
    placeId: 'ChIJoaDg6Kk_244RVXV35_mpcHU',
    name: 'Redbones Blues Café',
    neighborhood: 'Belmont Road',
    area: 'Kingston',
    description:
      'Kingston’s long-running blues and jazz room on Argyle Road — courtyard tables, a serious kitchen, and live sets that run late.',
    useStreetView: true,
  },
  {
    id: 'sugarcane-rooftop',
    placeId: 'ChIJU4ulfgA_244Rsw-Fc8amsDM',
    name: 'Mezza Luna Rooftop',
    neighborhood: 'Constant Spring',
    area: 'Kingston',
    category: 'restaurant',
    description:
      'Rooftop dining above Constant Spring — Italian-Caribbean plates, city lights, and a proper Kingston night-out energy.',
  },
  {
    id: 'miss-t',
    placeId: 'ChIJ8ew4p_8-244RqEG8z9SM2xo',
    name: 'Chilitos Jamexican',
    neighborhood: 'Hope Road',
    area: 'Kingston',
    category: 'restaurant',
    description:
      'Jamaican-Mexican mashup on Hope Road — tacos, burritos, and local heat. Casual, colourful, and always buzzing.',
  },
  {
    id: 'tracks-records',
    placeId: 'ChIJI1Fzg0s-244R_tp6kNAgyGA',
    name: "Usain Bolt's Tracks & Records",
    neighborhood: 'Constant Spring',
    area: 'Kingston',
    description:
      'Bolt’s Kingston spot at Market Place — big screens, cocktails, and a dressed-up crowd catching the match then the after-vibe.',
  },
  {
    id: 'level-up-gaming',
    query: 'Treasure Hunt Gaming Lounge Kingston',
    name: 'Treasure Hunt Gaming Lounge',
    neighborhood: 'New Kingston',
    area: 'Kingston',
    description:
      'Kingston gaming lounge with console and PC setups — book a booth with the squad or drop in after work.',
  },
  {
    id: 'bob-marley-museum',
    query: 'Bob Marley Museum Kingston Jamaica',
    name: 'Bob Marley Museum',
    neighborhood: 'Hope Road',
    area: 'Kingston',
  },
  {
    id: 'hope-botanical',
    query: 'Hope Botanical Gardens Kingston Jamaica',
    name: 'Hope Botanical Gardens',
    neighborhood: 'Papine',
    area: 'Kingston',
  },
  {
    id: 'gloria-seafood',
    query: "Gloria's Seafood Restaurant Port Royal Jamaica",
    name: "Gloria's Seafood",
    neighborhood: 'Port Royal',
    area: 'Kingston',
  },
  {
    id: 'deaf-can-coffee',
    query: 'Deaf Can Coffee Kingston Jamaica',
    name: 'Deaf Can! Coffee',
    neighborhood: 'New Kingston',
    area: 'Kingston',
  },
  {
    id: 'palace-cineplex',
    query: 'Palace Cineplex Sovereign Centre Kingston',
    name: 'Palace Cineplex',
    neighborhood: 'Sovereign Centre',
    area: 'Kingston',
  },
]

function inKingstonMetro(lat, lng) {
  return lat > 17.85 && lat < 18.15 && lng > -76.95 && lng < -76.7
}

async function textSearch(query) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
  url.searchParams.set('query', query)
  url.searchParams.set('location', '18.0179,-76.8099')
  url.searchParams.set('radius', '25000')
  url.searchParams.set('key', mapsKey)
  const json = await fetch(url).then((r) => r.json())
  if (json.status !== 'OK') throw new Error(`TextSearch ${json.status}: ${query}`)
  const hit = (json.results || []).find((r) =>
    inKingstonMetro(r.geometry.location.lat, r.geometry.location.lng),
  )
  if (!hit) throw new Error(`No Kingston match for ${query}`)
  return hit.place_id
}

async function details(placeId) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set(
    'fields',
    'name,formatted_address,geometry,photos,rating,user_ratings_total',
  )
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
  return {
    buf: Buffer.from(await res.arrayBuffer()),
    type,
    ext: type.includes('png') ? 'png' : 'jpg',
  }
}

async function downloadStreetView(lat, lng) {
  const url = new URL('https://maps.googleapis.com/maps/api/streetview')
  url.searchParams.set('size', '1600x1066')
  url.searchParams.set('location', `${lat},${lng}`)
  url.searchParams.set('fov', '90')
  url.searchParams.set('pitch', '10')
  url.searchParams.set('key', mapsKey)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`streetview ${res.status}`)
  return { buf: Buffer.from(await res.arrayBuffer()), type: 'image/jpeg', ext: 'jpg' }
}

async function downloadUrl(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'OutYahSeed/1.0 (place photo sync)' },
  })
  if (!res.ok) throw new Error(`download ${res.status}`)
  const type = (res.headers.get('content-type') || 'image/jpeg').split(';')[0]
  return {
    buf: Buffer.from(await res.arrayBuffer()),
    type,
    ext: type.includes('png') ? 'png' : 'jpg',
  }
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
  const placeId = v.placeId || (await textSearch(v.query))
  const d = await details(placeId)
  const lat = d.geometry.location.lat
  const lng = d.geometry.location.lng
  if (!inKingstonMetro(lat, lng)) {
    throw new Error(`Outside Kingston metro: ${d.name} (${lat},${lng})`)
  }

  const urls = []
  const photos = d.photos || []

  // Prefer curated real-site stills (e.g. Wikimedia Devon House) as cover when provided
  if (v.extraUrls?.length) {
    let i = 0
    for (const extra of v.extraUrls) {
      try {
        const { buf, type, ext } = await downloadUrl(extra)
        urls.push(await upload(v.id, `wiki-${i++}.${ext}`, buf, type))
      } catch (err) {
        console.warn(`  wiki skip: ${err.message}`)
      }
    }
  }

  if (photos.length) {
    const take = Math.min(3, photos.length)
    for (let i = 0; i < take; i++) {
      const { buf, type, ext } = await downloadGooglePhoto(photos[i].photo_reference)
      urls.push(await upload(v.id, `place-${i}.${ext}`, buf, type))
    }
  } else if (v.useStreetView) {
    const { buf, type, ext } = await downloadStreetView(lat, lng)
    urls.push(await upload(v.id, `streetview.${ext}`, buf, type))
  }

  if (!urls.length) throw new Error('No photos collected')

  const patch = {
    name: v.name || d.name,
    neighborhood: v.neighborhood,
    area: v.area,
    image: urls[0],
    images: urls,
    address: d.formatted_address,
    lat,
    lng,
    rating: d.rating ?? 0,
    review_count: d.user_ratings_total ?? 0,
    updated_at: new Date().toISOString(),
  }
  if (v.category) patch.category = v.category
  if (v.description) patch.description = v.description

  const { error } = await supabase.from('places').update(patch).eq('id', v.id)
  if (error) throw error
  return { id: v.id, googleName: d.name, count: urls.length, address: d.formatted_address }
}

async function main() {
  if (!mapsKey || !supabaseUrl || !serviceKey) {
    console.error('Missing env')
    process.exit(1)
  }
  console.log(`Syncing real photos for ${VENUES.length} places…\n`)
  let failed = 0
  for (const v of VENUES) {
    process.stdout.write(`→ ${v.id} … `)
    try {
      const r = await processVenue(v)
      console.log(`OK ${r.count} imgs ← ${r.googleName}`)
      console.log(`   ${r.address}`)
    } catch (err) {
      failed += 1
      console.log(`FAIL ${err.message}`)
    }
  }
  if (failed) process.exitCode = 1
}

main()
