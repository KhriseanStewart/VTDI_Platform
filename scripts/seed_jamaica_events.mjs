/**
 * Apply events schedule columns + seed Jamaica Independence week events.
 * Usage: bun scripts/seed_jamaica_events.mjs
 */
import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'
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

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const img = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1400`

/** Jamaica local times as ISO with -05:00 offset */
const jm = (isoLocal) => new Date(isoLocal).toISOString()

async function applyMigration() {
  if (!process.env.DATABASE_URL) {
    console.warn('No DATABASE_URL — skipping ALTER (columns may already exist)')
    return
  }
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 1 })
  try {
    await sql.unsafe(`
      alter table public.events
        add column if not exists starts_at timestamptz,
        add column if not exists ends_at timestamptz,
        add column if not exists recurring boolean not null default false,
        add column if not exists recurrence_note text;
      create index if not exists events_starts_at_idx on public.events (starts_at desc nulls last);
    `)
    console.log('✓ Migration applied')
  } finally {
    await sql.end({ timeout: 5 })
  }
}

async function placeImage(id, fallbackPexels) {
  const { data } = await supabase.from('places').select('image').eq('id', id).maybeSingle()
  return data?.image || img(fallbackPexels)
}

async function main() {
  await applyMigration()

  const tracksImg = await placeImage('tracks-records', 1105666)
  const hopeImg = await placeImage('hope-botanical', 2387873)
  const bobImg = await placeImage('bob-marley-museum', 1763075)

  const events = [
    {
      id: 'emancipation-cultural-night',
      title: 'Emancipation Cultural Night',
      type: 'Culture',
      date_label: 'Fri, Jul 31',
      time_label: '7:00 PM',
      venue_name: 'Emancipation Park',
      place_id: null,
      area: 'Kingston',
      image: img(3184183),
      description:
        'A warm-up night of dance, drumming, and spoken word marking Emancipation — the soft open before Independence weekend.',
      going: 0,
      interested: 0,
      price: 'Free',
      attendees: [],
      starts_at: jm('2026-07-31T19:00:00-05:00'),
      ends_at: jm('2026-07-31T23:00:00-05:00'),
      recurring: true,
      recurrence_note: 'Annual around Emancipation Day (Aug 1)',
    },
    {
      id: 'independence-village-2026',
      title: 'Jamaica Independence Village',
      type: 'Festival',
      date_label: 'Aug 1–6',
      time_label: 'From 4:00 PM',
      venue_name: 'National Stadium Complex',
      place_id: null,
      area: 'Kingston',
      image: img(1190297),
      description:
        'The cultural hub for Independence week — exhibitions, family attractions, and nightly entertainment at the National Stadium complex. Tickets required for some evening programmes.',
      going: 0,
      interested: 0,
      price: 'Free entry · tickets for nights',
      attendees: [],
      starts_at: jm('2026-08-01T16:00:00-05:00'),
      ends_at: jm('2026-08-06T23:00:00-05:00'),
      recurring: true,
      recurrence_note: 'Annual Independence Week tradition',
    },
    {
      id: 'yesterday-90s-2026',
      title: 'Yesterday: The Best of the 90s',
      type: 'Party',
      date_label: 'Sat, Aug 1',
      time_label: '10:00 PM',
      venue_name: 'Mas Camp, National Stadium',
      place_id: null,
      area: 'Kingston',
      image: img(1763075),
      description:
        'Emancipation night throwback — pure 90s dancehall, fashion, and nostalgia at Mas Camp. Gates 10 PM.',
      going: 0,
      interested: 0,
      price: 'Ticketed',
      attendees: [],
      starts_at: jm('2026-08-01T22:00:00-05:00'),
      ends_at: jm('2026-08-02T03:00:00-05:00'),
      recurring: false,
      recurrence_note: null,
    },
    {
      id: 'carnival-in-the-farm-2026',
      title: 'Carnival in the Farm',
      type: 'Carnival',
      date_label: 'Sun, Aug 2',
      time_label: '1:00 PM',
      venue_name: 'Marcus Garvey Drive & East Avenue',
      place_id: null,
      area: 'Kingston',
      image: img(2253275),
      description:
        'Paint, water, sound trucks, and road march energy. Early bird, general, and truck passes — Kingston carnival vibes for Independence weekend.',
      going: 0,
      interested: 0,
      price: 'From J$1,500',
      attendees: [],
      starts_at: jm('2026-08-02T13:00:00-05:00'),
      ends_at: jm('2026-08-02T23:00:00-05:00'),
      recurring: false,
      recurrence_note: null,
    },
    {
      id: 'house-jam-tracks-2026',
      title: 'House Jam',
      type: 'Live Music',
      date_label: 'Wed, Aug 5',
      time_label: '8:00 PM',
      venue_name: "Usain Bolt's Tracks & Records",
      place_id: 'tracks-records',
      area: 'Kingston',
      image: tracksImg,
      description:
        'Reggae, dancehall, and Afro under one roof the night before Independence Day. House Jam returns to Tracks & Records on Constant Spring.',
      going: 0,
      interested: 0,
      price: 'Ticketed',
      attendees: [],
      starts_at: jm('2026-08-05T20:00:00-05:00'),
      ends_at: jm('2026-08-06T02:00:00-05:00'),
      recurring: true,
      recurrence_note: 'Recurring club series at Tracks & Records',
    },
    {
      id: 'independence-grand-gala-2026',
      title: 'Independence Grand Gala',
      type: 'National',
      date_label: 'Thu, Aug 6',
      time_label: 'Evening',
      venue_name: 'National Stadium',
      place_id: null,
      area: 'Kingston',
      image: img(4571219),
      description:
        'Jamaica’s flagship Independence celebration — cultural performances, Creative City of Music tributes, fireworks, and the national stage. Free admission; tickets required.',
      going: 0,
      interested: 0,
      price: 'Free (ticketed)',
      attendees: [],
      starts_at: jm('2026-08-06T18:00:00-05:00'),
      ends_at: jm('2026-08-06T23:30:00-05:00'),
      recurring: true,
      recurrence_note: 'Annual every Independence Day (Aug 6)',
    },
    {
      id: 'hope-gardens-sunrise-walk',
      title: 'Hope Gardens Sunrise Walk',
      type: 'Wellness',
      date_label: 'Saturdays',
      time_label: '6:00 AM',
      venue_name: 'Hope Botanical Gardens',
      place_id: 'hope-botanical',
      area: 'Kingston',
      image: hopeImg,
      description:
        'Easy community walk through the palms at first light — coffee after optional. A calm reset before Kingston wakes up.',
      going: 0,
      interested: 0,
      price: 'Free',
      attendees: [],
      starts_at: jm('2026-08-09T06:00:00-05:00'),
      ends_at: jm('2026-08-09T07:30:00-05:00'),
      recurring: true,
      recurrence_note: 'Most Saturdays at sunrise',
    },
    {
      id: 'bob-marley-museum-night-tour',
      title: 'Bob Marley Museum Evening Tour',
      type: 'Culture',
      date_label: 'Fri nights',
      time_label: '6:30 PM',
      venue_name: 'Bob Marley Museum',
      place_id: 'bob-marley-museum',
      area: 'Kingston',
      image: bobImg,
      description:
        'Guided evening walk through Bob’s former home — studio stories under the Hope Road trees. Book ahead; spaces limited.',
      going: 0,
      interested: 0,
      price: 'Ticketed',
      attendees: [],
      starts_at: jm('2026-08-08T18:30:00-05:00'),
      ends_at: jm('2026-08-08T20:00:00-05:00'),
      recurring: true,
      recurrence_note: 'Select Friday evenings',
    },
  ]

  console.log(`Upserting ${events.length} events…`)
  const { data, error } = await supabase.from('events').upsert(events, { onConflict: 'id' }).select('id, title')
  if (error) {
    console.error(error)
    process.exit(1)
  }
  for (const row of data || []) console.log(`  ✓ ${row.title}`)
}

main()
