import { useEffect, useMemo, useState } from 'react'
import { areaCentroid } from '../lib/pulse'
import { fetchWeather } from '../lib/weather'

/**
 * A clock that ticks, so "starting in 90 min" stays honest without a reload.
 * Also resyncs when the tab regains focus after being backgrounded.
 */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())
    const id = setInterval(tick, intervalMs)
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [intervalMs])

  return now
}

/**
 * Current conditions for the parish in view. Resolves to null whenever the
 * lookup is unavailable so callers can skip the hint entirely.
 */
export function useParishWeather(places, area) {
  // Keyed by location so a parish change can't briefly show the old forecast.
  const [result, setResult] = useState({ key: null, value: null })

  const centroid = useMemo(() => areaCentroid(places, area), [places, area])
  const lat = centroid?.lat ?? null
  const lng = centroid?.lng ?? null
  const key = lat == null || lng == null ? null : `${lat.toFixed(2)},${lng.toFixed(2)}`

  useEffect(() => {
    if (lat == null || lng == null) return
    const controller = new AbortController()
    let cancelled = false

    fetchWeather({ lat, lng }, { signal: controller.signal }).then((value) => {
      if (!cancelled) setResult({ key: `${lat.toFixed(2)},${lng.toFixed(2)}`, value })
    })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [lat, lng])

  return result.key === key ? result.value : null
}
