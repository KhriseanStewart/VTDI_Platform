/**
 * Seed island-wide places + 6-month events calendar.
 * Usage: bun scripts/seed_jamaica_catalog.mjs
 */
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const root = process.cwd()
const scripts = ['seed_jamaica_places.mjs', 'seed_jamaica_events.mjs']

for (const script of scripts) {
  console.log(`\n── ${script} ──\n`)
  const r = spawnSync('bun', [resolve(root, 'scripts', script)], { stdio: 'inherit', cwd: root })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

console.log('\n✓ Jamaica catalog seeded (places + events).')
console.log('  Optional: bun scripts/seed_jamaica_island_photos.mjs')
console.log('  Optional: bun scripts/seed_real_place_reviews.mjs')
