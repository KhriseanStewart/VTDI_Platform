import postgres from 'postgres'

const ref = 'ervmrunpppfhogopjfcf'
const password = process.env.PW
if (!password) {
  console.error('Missing PW')
  process.exit(1)
}

const candidates = [
  `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`,
  `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-us-east-2.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
]

for (const url of candidates) {
  const host = url.split('@')[1]
  try {
    const sql = postgres(url, { ssl: 'require', connect_timeout: 8, max: 1 })
    const rows = await sql`select current_database() as db, current_user as usr`
    console.log('SUCCESS', host, rows)
    await sql.end({ timeout: 1 })
    process.exit(0)
  } catch (e) {
    console.log('FAIL', host, e.code || String(e.message).slice(0, 160))
  }
}
process.exit(1)
