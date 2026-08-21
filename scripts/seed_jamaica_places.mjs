/**
 * Upsert island-wide tourist places into Supabase.
 * Usage: bun scripts/seed_jamaica_places.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { JAMAICA_PLACES } from './data/jamaica_places.mjs'
import { loadEnv } from './lib/seed-env.mjs'

loadEnv()

const url = process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

async function main() {
  const rows = JAMAICA_PLACES.map((p) => ({
    ...p,
    open_now: false,
    special: null,
    phone: null,
    reviews: [],
    slots: null,
    slot_label: null,
    updated_at: new Date().toISOString(),
  }))

  console.log(`Upserting ${rows.length} Jamaica places…`)
  const { data, error } = await supabase.from('places').upsert(rows, { onConflict: 'id' }).select('id, name, area')
  if (error) {
    console.error(error)
    process.exit(1)
  }
  for (const row of data || []) console.log(`  ✓ ${row.name} (${row.area})`)
  console.log(`\nDone — ${data?.length ?? 0} places upserted.`)
}

main()
