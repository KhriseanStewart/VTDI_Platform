/**
 * Apply events schedule columns + seed island-wide 6-month calendar.
 * Usage: bun scripts/seed_jamaica_events.mjs
 */
import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'
import { JAMAICA_EVENTS } from './data/jamaica_events.mjs'
import { loadEnv } from './lib/seed-env.mjs'

loadEnv()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

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

async function main() {
  await applyMigration()

  console.log(`Upserting ${JAMAICA_EVENTS.length} events…`)
  const { data, error } = await supabase.from('events').upsert(JAMAICA_EVENTS, { onConflict: 'id' }).select('id, title, area')
  if (error) {
    console.error(error)
    process.exit(1)
  }
  for (const row of data || []) console.log(`  ✓ ${row.title} (${row.area})`)
  console.log(`\nDone — ${data?.length ?? 0} events upserted.`)
}

main()
