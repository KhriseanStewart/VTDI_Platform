/**
 * Upsert curated Kingston places into Supabase (service role).
 * Usage: bun scripts/seed_kingston_places.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!m) continue
    const key = m[1]
    let val = m[2]
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv()

const url = process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

/** Pexels CDN (Unsplash hotlinks currently 404) */
const img = (id, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`

const hoursEveryday = (open, close) =>
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
    day,
    open,
    close,
    closed: false,
  }))

const places = [
  {
    id: 'sugarcane-rooftop',
    name: 'Sugarcane Rooftop',
    category: 'restaurant',
    neighborhood: 'New Kingston',
    area: 'Kingston',
    image: img(262978),
    images: [img(262978), img(1267320), img(1581384)],
    rating: 4.7,
    review_count: 1284,
    price_range: 3500,
    currency: 'JMD',
    tags: ['Open now', 'Rooftop views', 'Live music tonight'],
    open_until: '11:00 PM',
    open_now: true,
    description:
      'String lights, skyline breeze, and modern Caribbean plates in the heart of New Kingston. Come for jerk-spiced small plates and rum-forward cocktails — stay for golden hour over Knutsford.',
    amenities: ['Rooftop seating', 'Full bar', 'Live music', 'Reservations', 'Vegan options'],
    address: '17 Knutsford Blvd, New Kingston, Kingston',
    phone: '+1 876-555-0142',
    lat: 18.0075,
    lng: -76.789,
    hours: hoursEveryday('4:00 PM', '11:00 PM'),
    special: 'Happy hour 5–7 PM: 2-for-1 rum punch',
    reviews: [],
  },
  {
    id: 'devon-house',
    name: 'Devon House I-Scream',
    category: 'attraction',
    neighborhood: 'Hope Road',
    area: 'Kingston',
    image: img(1352281),
    images: [img(1352281), img(1362534), img(291528)],
    rating: 4.8,
    review_count: 5402,
    price_range: 1200,
    currency: 'JMD',
    tags: ['Local favorite', 'Date spot', 'Family friendly'],
    open_until: '10:00 PM',
    open_now: true,
    description:
      'The island’s most famous ice cream under the verandah of a Georgian great house. Grapenut is non-negotiable; stroll the courtyard after and soak up Kingston’s soft evening light.',
    amenities: ['Courtyard', 'Gift shop', 'Parking', 'Family friendly'],
    address: '26 Hope Rd, Kingston 10',
    phone: '+1 876-929-6602',
    lat: 18.0159,
    lng: -76.782,
    hours: hoursEveryday('10:00 AM', '10:00 PM'),
    special: null,
    reviews: [],
  },
  {
    id: 'red-bones',
    name: 'Red Bones Blues Café',
    category: 'bar',
    neighborhood: 'Belmont Road',
    area: 'Kingston',
    image: img(1105666),
    images: [img(1105666), img(1763075), img(1190297)],
    rating: 4.6,
    review_count: 1890,
    price_range: 4000,
    currency: 'JMD',
    tags: ['Live music', 'Open late', 'Wine list'],
    open_until: '1:00 AM',
    open_now: true,
    description:
      'Kingston’s go-to for live jazz, blues, and soul with a serious kitchen and wine list. Dim lighting, courtyard tables, and that late-night “one more set” energy.',
    amenities: ['Live music', 'Full bar', 'Courtyard', 'Reservations'],
    address: '1 Argyle Rd / Belmont Rd, Kingston',
    phone: '+1 876-978-8262',
    lat: 18.0128,
    lng: -76.7855,
    hours: hoursEveryday('12:00 PM', '1:00 AM'),
    special: 'Live band most nights from 8 PM',
    reviews: [],
  },
  {
    id: 'deaf-can-coffee',
    name: 'Deaf Can! Coffee',
    category: 'cafe',
    neighborhood: 'Manor Park',
    area: 'Kingston',
    image: img(302899),
    images: [img(302899), img(1307698), img(374885)],
    rating: 4.9,
    review_count: 812,
    price_range: 1500,
    currency: 'JMD',
    tags: ['Open now', 'Community gem', 'Laptop friendly'],
    open_until: '6:00 PM',
    open_now: true,
    description:
      'A bright social-enterprise café training deaf baristas. Expect beautiful espresso, homemade treats, and one of the warmest rooms in Kingston 8.',
    amenities: ['Free WiFi', 'Pastries', 'Community', 'Card accepted'],
    address: 'Manor Park Plaza, Kingston 8',
    phone: '+1 876-555-0173',
    lat: 18.0355,
    lng: -76.7902,
    hours: hoursEveryday('7:30 AM', '6:00 PM'),
    special: null,
    reviews: [],
  },
  {
    id: 'bob-marley-museum',
    name: 'Bob Marley Museum',
    category: 'attraction',
    neighborhood: 'Hope Road',
    area: 'Kingston',
    image: img(1763075),
    images: [img(1763075), img(1190297), img(4571219)],
    rating: 4.7,
    review_count: 6200,
    price_range: 2500,
    currency: 'JMD',
    tags: ['Must see', 'Guided tour', 'Reggae history'],
    open_until: '4:00 PM',
    open_now: true,
    description:
      'Bob’s former home turned living archive — studio, courtyard, and stories that shaped reggae. Book the guided tour and leave with goosebumps.',
    amenities: ['Guided tours', 'Gift shop', 'Photo spots', 'Parking'],
    address: '56 Hope Rd, Kingston 6',
    phone: '+1 876-927-9152',
    lat: 18.0194,
    lng: -76.7758,
    hours: hoursEveryday('9:30 AM', '4:00 PM'),
    special: null,
    reviews: [],
  },
  {
    id: 'hellshire-beach',
    name: 'Hellshire Beach',
    category: 'beach',
    neighborhood: 'Hellshire',
    area: 'St. Catherine',
    image: img(1170412),
    images: [img(1170412), img(1032650), img(3155666)],
    rating: 4.5,
    review_count: 3100,
    price_range: 2000,
    currency: 'JMD',
    tags: ['Weekend vibe', 'Fried fish', 'Day trip'],
    open_until: '6:00 PM',
    open_now: true,
    description:
      'Kingston’s classic Sunday escape — white sand, turquoise shallows, and frying fish straight from the stalls. Get festival, a cold drink, and don’t rush.',
    amenities: ['Beach', 'Seafood stalls', 'Parking', 'Family friendly'],
    address: 'Hellshire Beach, Portmore',
    phone: null,
    lat: 17.885,
    lng: -76.903,
    hours: hoursEveryday('8:00 AM', '6:00 PM'),
    special: null,
    reviews: [],
  },
  {
    id: 'miss-t',
    name: "Miss T's Kitchen",
    category: 'restaurant',
    neighborhood: 'Half Way Tree',
    area: 'Kingston',
    image: img(1640777),
    images: [img(1640777), img(1279330), img(704971)],
    rating: 4.6,
    review_count: 980,
    price_range: 2200,
    currency: 'JMD',
    tags: ['Yard food', 'Open now', 'Comfort plates'],
    open_until: '10:00 PM',
    open_now: true,
    description:
      'Homestyle Kingston cooking done right — oxtail that falls apart, rice & peas, and pepper sauce that wakes you up. Casual, filling, and unapologetically local.',
    amenities: ['Takeout', 'Outdoor seating', 'Family friendly', 'Cash & card'],
    address: 'Half Way Tree Rd, Kingston',
    phone: '+1 876-555-0199',
    lat: 18.011,
    lng: -76.7985,
    hours: hoursEveryday('11:00 AM', '10:00 PM'),
    special: null,
    reviews: [],
  },
  {
    id: 'tracks-records',
    name: "Tracks & Records",
    category: 'bar',
    neighborhood: 'New Kingston',
    area: 'Kingston',
    image: img(1267320),
    images: [img(1267320), img(3184183), img(2253275)],
    rating: 4.3,
    review_count: 2140,
    price_range: 3000,
    currency: 'JMD',
    tags: ['Sports screens', 'Date night', 'Cocktails'],
    open_until: '12:00 AM',
    open_now: true,
    description:
      'Big screens, bold cocktails, and a New Kingston crowd that shows up dressed. Catch the match, then migrate to the patio for the after-vibe.',
    amenities: ['Sports TV', 'Full bar', 'Patio', 'Parking'],
    address: 'Marketplace, Kingston',
    phone: '+1 876-906-3903',
    lat: 18.0058,
    lng: -76.7908,
    hours: hoursEveryday('11:00 AM', '12:00 AM'),
    special: null,
    reviews: [],
  },
  {
    id: 'palace-cineplex',
    name: 'Palace Cineplex',
    category: 'movies',
    neighborhood: 'Sovereign Centre',
    area: 'Kingston',
    image: img(7991579),
    images: [img(7991579), img(7991431), img(7991576)],
    rating: 4.2,
    review_count: 1560,
    price_range: 1800,
    currency: 'JMD',
    tags: ['Showtimes', 'AC escape', 'Date night'],
    open_until: '11:00 PM',
    open_now: true,
    description:
      'Kingston’s reliable cinema night — cold AC, smart seats, and the latest releases at Sovereign. Grab popcorn and make an evening of it.',
    amenities: ['Multiple screens', 'Snacks', 'Parking', 'Card accepted'],
    address: 'Sovereign Centre, Hope Rd, Kingston 6',
    phone: '+1 876-978-3529',
    lat: 18.0142,
    lng: -76.7725,
    hours: hoursEveryday('12:00 PM', '11:00 PM'),
    special: null,
    reviews: [],
    slots: [
      { time: '1:30 PM', label: 'Matinee', available: true },
      { time: '4:15 PM', label: 'Afternoon', available: true },
      { time: '7:00 PM', label: 'Prime', available: true },
      { time: '9:45 PM', label: 'Late', available: false },
    ],
    slot_label: "Today's showtimes",
  },
  {
    id: 'level-up-gaming',
    name: 'Level Up Gaming Lounge',
    category: 'gaming',
    neighborhood: 'Half Way Tree',
    area: 'Kingston',
    image: img(3165335),
    images: [img(3165335), img(442576), img(194511)],
    rating: 4.6,
    review_count: 430,
    price_range: 2000,
    currency: 'JMD',
    tags: ['Squad night', 'PS5 & PC', 'Open late'],
    open_until: '11:00 PM',
    open_now: true,
    description:
      'Clean setups, fast Wi‑Fi, and FIFA nights that get loud. Book a booth with the crew or drop in for ranked sessions after work.',
    amenities: ['PC stations', 'Consoles', 'AC', 'Snacks'],
    address: 'Twin Gates Plaza, Half Way Tree',
    phone: '+1 876-555-0220',
    lat: 18.0102,
    lng: -76.797,
    hours: hoursEveryday('1:00 PM', '11:00 PM'),
    special: 'FIFA tournament Fridays',
    reviews: [],
    slots: [
      { time: '2:00 PM', label: 'PC Station', available: true },
      { time: '4:00 PM', label: 'PS5 Booth', available: true },
      { time: '6:00 PM', label: 'Squad Room', available: false },
      { time: '8:00 PM', label: 'VR Bay', available: true },
    ],
    slot_label: 'Book a station',
  },
  {
    id: 'hope-botanical',
    name: 'Hope Botanical Gardens',
    category: 'attraction',
    neighborhood: 'Papine',
    area: 'Kingston',
    image: img(2387873),
    images: [img(2387873), img(1285625), img(1457842)],
    rating: 4.4,
    review_count: 980,
    price_range: 1000,
    currency: 'JMD',
    tags: ['Golden hour', 'Picnic spot', 'Free vibe'],
    open_until: '6:00 PM',
    open_now: true,
    description:
      'Palm avenues, open lawns, and cool mountain air at the foot of the Blue Mountains. Perfect for picnic blankets, photos, and a slow Kingston afternoon.',
    amenities: ['Gardens', 'Walking paths', 'Parking', 'Family friendly'],
    address: 'Old Hope Rd, Kingston 6',
    phone: '+1 876-927-1257',
    lat: 18.0218,
    lng: -76.7485,
    hours: hoursEveryday('6:00 AM', '6:00 PM'),
    special: null,
    reviews: [],
  },
  {
    id: 'gloria-seafood',
    name: "Gloria's Seafood",
    category: 'restaurant',
    neighborhood: 'Port Royal',
    area: 'Kingston',
    image: img(725991),
    images: [img(725991), img(262959), img(2098085)],
    rating: 4.5,
    review_count: 1720,
    price_range: 2800,
    currency: 'JMD',
    tags: ['Seafood', 'Waterfront', 'Weekend trip'],
    open_until: '9:00 PM',
    open_now: true,
    description:
      'Port Royal seafood with a salty breeze — lobster, shrimp, and fried fish that tastes like the harbour. Drive out for lunch and watch the water while you eat.',
    amenities: ['Waterfront', 'Seafood', 'Parking', 'Family friendly'],
    address: 'Port Royal, Kingston',
    phone: '+1 876-967-8066',
    lat: 17.9365,
    lng: -76.841,
    hours: hoursEveryday('11:00 AM', '9:00 PM'),
    special: null,
    reviews: [],
  },
]

async function main() {
  console.log(`Upserting ${places.length} Kingston places…`)
  const { data, error } = await supabase.from('places').upsert(places, { onConflict: 'id' }).select('id, name')
  if (error) {
    console.error(error)
    process.exit(1)
  }
  console.log('Done:')
  for (const row of data || []) console.log(`  ✓ ${row.name} (${row.id})`)
}

main()
