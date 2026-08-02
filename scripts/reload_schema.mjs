import postgres from 'postgres'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      let v = l.slice(i + 1)
      if ((v[0] === '"' && v.endsWith('"')) || (v[0] === "'" && v.endsWith("'"))) v = v.slice(1, -1)
      return [l.slice(0, i), v]
    }),
)

const sql = postgres(env.DATABASE_URL, { ssl: 'require', max: 1 })
const cols = await sql`
  select column_name
  from information_schema.columns
  where table_schema = 'public' and table_name = 'events'
  order by 1
`
console.log(
  'columns:',
  cols.map((c) => c.column_name).join(', '),
)
await sql.unsafe(`notify pgrst, 'reload schema'`)
await sql.end({ timeout: 5 })
console.log('schema reload notified')
