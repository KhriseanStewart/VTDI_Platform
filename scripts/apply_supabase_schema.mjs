/**
 * Apply OutYah schema + seed to remote Supabase.
 *
 * Needs either:
 *   SUPABASE_DB_PASSWORD  (Project Settings → Database)
 * or DATABASE_URL
 *
 * Optional: SUPABASE_SERVICE_ROLE_KEY to verify via REST after.
 *
 * Usage:
 *   bun scripts/apply_supabase_schema.mjs
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import postgres from 'postgres'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const ref = 'ervmrunpppfhogopjfcf'

function loadEnvFile() {
  try {
    const raw = readFileSync(resolve(root, '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
    }
  } catch {
    /* ignore */
  }
}

loadEnvFile()

function buildUrls() {
  if (process.env.DATABASE_URL) return [process.env.DATABASE_URL]
  const password = process.env.SUPABASE_DB_PASSWORD
  if (!password) return []
  const enc = encodeURIComponent(password)
  // Prefer session pooler (5432) for DDL; fall back to transaction pooler + direct
  return [
    `postgresql://postgres.${ref}:${enc}@aws-0-ca-central-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres.${ref}:${enc}@aws-0-ca-central-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres:${enc}@db.${ref}.supabase.co:5432/postgres`,
  ]
}

const urls = buildUrls()
if (!urls.length) {
  console.error(`
Missing database credentials.

Add to .env:
  SUPABASE_DB_PASSWORD=your-database-password

Find/reset it at:
  https://supabase.com/dashboard/project/${ref}/settings/database

The service_role key can read/write data, but cannot CREATE tables.
`)
  process.exit(1)
}

const sqlFile = resolve(root, 'supabase/full_setup.sql')
const setupSql = readFileSync(sqlFile, 'utf8')

let sql
let usedHost = ''
for (const url of urls) {
  usedHost = url.split('@')[1]
  try {
    console.log('Connecting via', usedHost, '…')
    sql = postgres(url, {
      ssl: 'require',
      max: 1,
      connect_timeout: 20,
      idle_timeout: 20,
      prepare: false,
      connection: { application_name: 'outyah-schema-apply' },
    })
    await sql`select current_database() as db, current_user as usr`
    console.log('Connected.')
    break
  } catch (err) {
    console.log('  failed:', err.message?.slice(0, 120))
    if (sql) await sql.end({ timeout: 1 }).catch(() => {})
    sql = null
  }
}

if (!sql) {
  console.error('Could not connect with any connection URL')
  process.exit(1)
}

try {
  console.log('Applying full_setup.sql…')
  await sql.unsafe(setupSql)
  console.log('Schema + seed applied.')

  const counts = await sql`
    select
      (select count(*)::int from places) as places,
      (select count(*)::int from events) as events,
      (select count(*)::int from posts) as posts,
      (select count(*)::int from post_comments) as comments
  `
  console.log('Counts:', counts[0])
} catch (err) {
  console.error('Apply failed:', err.message || err)
  process.exitCode = 1
} finally {
  await sql.end({ timeout: 5 })
}

// REST verify with service role if present
const service = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl = process.env.VITE_SUPABASE_URL || `https://${ref}.supabase.co`
if (service && !process.exitCode) {
  const res = await fetch(`${supabaseUrl}/rest/v1/places?select=id&limit=3`, {
    headers: {
      apikey: service,
      Authorization: `Bearer ${service}`,
    },
  })
  const body = await res.text()
  console.log('REST verify:', res.status, body.slice(0, 200))
}
