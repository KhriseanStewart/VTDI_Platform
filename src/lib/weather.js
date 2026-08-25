/**
 * Parish weather as a go/no-go signal for outdoor plans.
 *
 * Uses Open-Meteo, which needs no API key, so this works in any environment.
 * Every failure path returns null — the Pulse strip simply omits the hint
 * rather than showing a broken or invented forecast.
 */

const ENDPOINT = 'https://api.open-meteo.com/v1/forecast'
const CACHE_TTL_MS = 10 * 60 * 1000
const cache = new Map()

/** WMO weather codes -> plain-language read plus an outdoor verdict. */
function describeCode(code) {
  if (code === 0) return { label: 'Clear', outdoor: 'good' }
  if (code <= 2) return { label: 'Mostly clear', outdoor: 'good' }
  if (code === 3) return { label: 'Overcast', outdoor: 'ok' }
  if (code === 45 || code === 48) return { label: 'Foggy', outdoor: 'ok' }
  if (code >= 51 && code <= 57) return { label: 'Drizzle', outdoor: 'ok' }
  if (code >= 61 && code <= 67) return { label: 'Rain', outdoor: 'poor' }
  if (code >= 71 && code <= 77) return { label: 'Wintry', outdoor: 'poor' }
  if (code >= 80 && code <= 82) return { label: 'Showers', outdoor: 'poor' }
  if (code >= 85 && code <= 86) return { label: 'Heavy showers', outdoor: 'poor' }
  if (code >= 95) return { label: 'Thunderstorms', outdoor: 'poor' }
  return { label: 'Mixed', outdoor: 'ok' }
}

/**
 * Current conditions for a coordinate.
 * @returns {Promise<{tempC: number|null, label: string, outdoor: 'good'|'ok'|'poor', isDay: boolean}|null>}
 */
export async function fetchWeather({ lat, lng }, { signal } = {}) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  // Round the key so nearby venues in a parish share one cache entry.
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value

  const url = `${ENDPOINT}?latitude=${lat.toFixed(3)}&longitude=${lng.toFixed(
    3,
  )}&current=temperature_2m,precipitation,weather_code,is_day&timezone=America%2FJamaica`

  try {
    const res = await fetch(url, { signal })
    if (!res.ok) return null
    const json = await res.json()
    const current = json?.current
    if (!current || typeof current.weather_code !== 'number') return null

    const { label, outdoor } = describeCode(current.weather_code)
    const value = {
      tempC: Number.isFinite(current.temperature_2m)
        ? Math.round(current.temperature_2m)
        : null,
      label,
      // Live precipitation overrides an optimistic code.
      outdoor: current.precipitation > 0.2 ? 'poor' : outdoor,
      isDay: current.is_day !== 0,
    }
    cache.set(key, { at: Date.now(), value })
    return value
  } catch {
    // Offline, blocked, or aborted — the hint is optional by design.
    return null
  }
}

/**
 * Turn conditions into an actionable suggestion.
 * @returns {{tone: 'good'|'ok'|'poor', text: string}}
 */
export function outdoorAdvice(weather, parishLabel = 'the island') {
  if (!weather) return null
  if (weather.outdoor === 'poor') {
    return {
      tone: 'poor',
      text: `${weather.label} in ${parishLabel} — good call for indoor spots`,
    }
  }
  if (weather.outdoor === 'ok') {
    return { tone: 'ok', text: `${weather.label} in ${parishLabel} — outdoor plans still fine` }
  }
  return {
    tone: 'good',
    text: weather.isDay
      ? `${weather.label} in ${parishLabel} — beach and outdoor weather`
      : `${weather.label} in ${parishLabel} — good night to be out`,
  }
}
