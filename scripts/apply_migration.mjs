/**
 * Apply ONE migration file to the remote Supabase database.
 *
 * Unlike apply_supabase_schema.mjs (which runs full_setup.sql: whole schema
 * plus legacy sample rows), this applies a single file and nothing else — the
 * right tool for adding an incremental migration to a live database.
 *
 * Needs DATABASE_URL or SUPABASE_DB_PASSWORD in .env.
 *
 * Usage:
 *   bun scripts/apply_migration.mjs supabase/migrations/006_event_chat.sql
 *   bun scripts/apply_migration.mjs <file> --dry-run
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ref = 'ervmrunpppfhogopjfcf'

function loadEnvFile() {
  try {
    const raw = readFileSync(resolve(root, '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (!m) continue
      let value = m[2]
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!process.env[m[1]]) process.env[m[1]] = value
    }
  } catch {
    /* no .env — rely on the ambient environment */
  }
}

loadEnvFile()

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const target = args.find((a) => !a.startsWith('--'))

if (!target) {
  console.error('Usage: bun scripts/apply_migration.mjs <path-to-migration.sql> [--dry-run]')
  process.exit(1)
}

const path = resolve(root, target)
let migration
try {
  migration = readFileSync(path, 'utf8')
} catch {
  console.error(`Cannot read migration file: ${path}`)
  process.exit(1)
}

console.log(`Migration: ${target} (${migration.split('\n').length} lines)`)

if (dryRun) {
  console.log('--dry-run: nothing was sent to the database.')
  process.exit(0)
}

function buildUrls() {
  if (process.env.DATABASE_URL) return [process.env.DATABASE_URL]
  const password = process.env.SUPABASE_DB_PASSWORD
  if (!password) return []
  const enc = encodeURIComponent(password)
  // Session pooler first: transaction pooling on 6543 is unreliable for DDL.
  return [
    `postgresql://postgres.${ref}:${enc}@aws-0-ca-central-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres:${enc}@db.${ref}.supabase.co:5432/postgres`,
  ]
}

const urls = buildUrls()
if (!urls.length) {
  console.error(
    'Missing database credentials. Add DATABASE_URL or SUPABASE_DB_PASSWORD to .env.\n' +
      `Find it at https://supabase.com/dashboard/project/${ref}/settings/database\n` +
      'The service_role key cannot run DDL.',
  )
  process.exit(1)
}

let sql = null
for (const url of urls) {
  const host = url.split('@')[1]
  try {
    console.log(`Connecting via ${host} …`)
    sql = postgres(url, {
      ssl: 'require',
      max: 1,
      connect_timeout: 20,
      idle_timeout: 20,
      prepare: false,
      connection: { application_name: 'outyah-migration' },
    })
    await sql`select 1`
    console.log('Connected.')
    break
  } catch (err) {
    console.log('  failed:', err.message?.slice(0, 120))
    if (sql) await sql.end({ timeout: 1 }).catch(() => {})
    sql = null
  }
}

if (!sql) {
  console.error('Could not connect with any connection URL.')
  process.exit(1)
}

try {
  await sql.unsafe(migration)
  console.log('Applied.')

  // PostgREST caches the schema; without this, new tables 404 until it reloads.
  await sql.unsafe(`notify pgrst, 'reload schema'`)
  console.log('Schema cache reload notified.')
} catch (err) {
  console.error('Apply failed:', err.message || err)
  process.exitCode = 1
} finally {
  await sql.end({ timeout: 5 })
}
