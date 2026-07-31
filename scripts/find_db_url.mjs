import postgres from 'postgres'

const ref = 'ervmrunpppfhogopjfcf'
const password = process.env.SUPABASE_DB_PASSWORD || 'Jujubear0606$'

const urls = [
  // Transaction pooler (6543) and session pooler (5432)
  `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-us-east-2.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`,
]

let working = null
for (const url of urls) {
  const host = url.split('@')[1]
  try {
    const sql = postgres(url, { ssl: 'require', connect_timeout: 15, max: 1 })
    const rows = await sql`select current_user as usr, current_database() as db`
    console.log('CONNECTED', host, rows[0])
    await sql.end({ timeout: 2 })
    working = url
    break
  } catch (e) {
    console.log('FAIL', host, e.code || String(e.message).slice(0, 160))
  }
}

if (!working) {
  console.error('No working connection')
  process.exit(1)
}

console.log('USING', working.split('@')[1])
process.stdout.write(working)
