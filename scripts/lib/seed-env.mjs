import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function loadEnv() {
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

/** Pexels CDN fallback images */
export const img = (id, w = 1400) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`

/** Jamaica local times → UTC ISO */
export const jm = (isoLocal) => new Date(isoLocal).toISOString()

/** Rough bounding box for Jamaica */
export function inJamaica(lat, lng) {
  return lat >= 17.7 && lat <= 18.53 && lng >= -78.37 && lng <= -76.18
}

export const JAMAICA_CENTER = { lat: 18.1096, lng: -77.2975 }
