/**
 * Jamaica Pulse — derives "what's actually on right now" from the catalog.
 *
 * Everything here is pure: pass in `now` and get a deterministic snapshot. The
 * reference clock is always Jamaica local time (America/Jamaica, UTC-5 with no
 * DST) so results don't drift for a visitor browsing from another timezone.
 */

export const JAMAICA_TZ = 'America/Jamaica'

/** Matches the `day` keys used by place.hours rows. */
const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_LONG = {
  Sun: 'Sunday',
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
}

const SOON_WINDOW_MIN = 120
const CLOSING_SOON_MIN = 90
/** Events without an explicit end are treated as running this long. */
const ASSUMED_EVENT_MIN = 180

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: JAMAICA_TZ,
  hour12: false,
  weekday: 'short',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * Current Jamaica-local wall clock.
 * @returns {{day: string, dayLong: string, minutes: number, hour: number, isoDate: string, isWeekend: boolean, partOfDay: string, clock: string}}
 */
export function jamaicaClock(now = new Date()) {
  const parts = {}
  for (const p of partsFormatter.formatToParts(now)) parts[p.type] = p.value

  // Intl renders midnight as "24" under hour12: false.
  const hour = Number(parts.hour) % 24
  const minute = Number(parts.minute)
  const day = parts.weekday
  const minutes = hour * 60 + minute

  return {
    day,
    dayLong: DAY_LONG[day] || day,
    hour,
    minutes,
    isoDate: `${parts.year}-${parts.month}-${parts.day}`,
    isWeekend: day === 'Fri' || day === 'Sat' || day === 'Sun',
    partOfDay: partOfDay(hour),
    clock: formatMinutes(minutes),
  }
}

function partOfDay(hour) {
  if (hour < 5) return 'late night'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  if (hour < 21) return 'evening'
  return 'night'
}

/** "4:00 PM" | "16:00" | "12:00 AM" -> minutes since midnight, or null. */
export function parseClock(value) {
  if (typeof value !== 'string') return null
  const m = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([ap]\.?m\.?)?$/i)
  if (!m) return null

  let hour = Number(m[1])
  const minute = m[2] ? Number(m[2]) : 0
  const meridiem = m[3]?.toLowerCase().replace(/\./g, '')

  if (hour > 23 || minute > 59) return null

  if (meridiem === 'pm' && hour < 12) hour += 12
  if (meridiem === 'am' && hour === 12) hour = 0

  return hour * 60 + minute
}

/** minutes since midnight -> "4:00 PM" */
export function formatMinutes(minutes) {
  const wrapped = ((minutes % 1440) + 1440) % 1440
  const hour24 = Math.floor(wrapped / 60)
  const minute = wrapped % 60
  const meridiem = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${hour12}:${String(minute).padStart(2, '0')} ${meridiem}`
}

/** Short relative phrasing for an offset in minutes. */
export function formatRelative(minutes) {
  if (minutes <= 0) return 'now'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours >= 24) {
    const days = Math.round(hours / 24)
    return days === 1 ? 'tomorrow' : `${days} days`
  }
  if (rest === 0) return `${hours} hr`
  return `${hours} hr ${rest} min`
}

function hoursRow(place, day) {
  return (place.hours || []).find((h) => h?.day === day) || null
}

/**
 * Is a single hours row active at `minutes`? Handles windows that run past
 * midnight (open 11:00 AM, close 2:00 AM).
 */
function rowState(row, minutes) {
  if (!row || row.closed) return null
  const open = parseClock(row.open)
  const close = parseClock(row.close)
  if (open == null || close == null) return null

  // A close time at/behind the open time means the venue runs overnight.
  const overnight = close <= open

  if (!overnight) {
    if (minutes < open || minutes >= close) return null
    return { closesInMin: close - minutes, closesAt: row.close }
  }

  if (minutes >= open) return { closesInMin: 1440 - minutes + close, closesAt: row.close }
  if (minutes < close) return { closesInMin: close - minutes, closesAt: row.close }
  return null
}

/**
 * Tail of an overnight window opened the previous day — covers venues that are
 * closed today but were still serving past midnight (e.g. closed Mon, but the
 * Sunday night window ran to 2:00 AM).
 */
function overnightTail(row, minutes) {
  if (!row || row.closed) return null
  const open = parseClock(row.open)
  const close = parseClock(row.close)
  if (open == null || close == null) return null
  if (close > open) return null // not an overnight window
  if (minutes >= close) return null // the tail already ended
  return { closesInMin: close - minutes, closesAt: row.close }
}

/**
 * Live open/closed state for a place.
 *
 * Prefers real `hours` data; falls back to the stored `openNow` flag when a
 * venue has no schedule, flagging the lower confidence via `source`.
 * @returns {{open: boolean, source: 'hours'|'flag', closesInMin?: number, closesAt?: string, closingSoon?: boolean, opensInMin?: number, opensAt?: string}}
 */
export function placeOpenState(place, clock = jamaicaClock()) {
  const today = hoursRow(place, clock.day)
  const yesterday = hoursRow(place, WEEK[(WEEK.indexOf(clock.day) + 6) % 7])

  if (!today && !yesterday) {
    return { open: Boolean(place.openNow), source: 'flag' }
  }

  // Today's window, or the tail of last night's overnight window.
  const active = rowState(today, clock.minutes) || overnightTail(yesterday, clock.minutes)

  if (active) {
    return {
      open: true,
      source: 'hours',
      closesInMin: active.closesInMin,
      closesAt: active.closesAt,
      closingSoon: active.closesInMin <= CLOSING_SOON_MIN,
    }
  }

  // Closed now — figure out when it next opens today.
  const openAt = today && !today.closed ? parseClock(today.open) : null
  if (openAt != null && openAt > clock.minutes) {
    return {
      open: false,
      source: 'hours',
      opensInMin: openAt - clock.minutes,
      opensAt: today.open,
    }
  }

  return { open: false, source: 'hours' }
}

/** Jamaica-local calendar date for a timestamp, for same-day comparisons. */
function jamaicaDate(value) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return jamaicaClock(d).isoDate
}

/**
 * Where an event sits relative to now.
 * @returns {{status: 'live'|'soon'|'today'|'upcoming'|'past', startsInMin: number|null, endsInMin: number|null, start: Date|null}}
 */
export function eventTiming(event, now = new Date(), clock = jamaicaClock(now)) {
  const start = event.startsAt ? new Date(event.startsAt) : null
  if (!start || Number.isNaN(start.getTime())) {
    return { status: 'upcoming', startsInMin: null, endsInMin: null, start: null }
  }

  const rawEnd = event.endsAt ? new Date(event.endsAt) : null
  const end =
    rawEnd && !Number.isNaN(rawEnd.getTime()) && rawEnd > start
      ? rawEnd
      : new Date(start.getTime() + ASSUMED_EVENT_MIN * 60_000)

  const startsInMin = Math.round((start.getTime() - now.getTime()) / 60_000)
  const endsInMin = Math.round((end.getTime() - now.getTime()) / 60_000)

  if (endsInMin < 0) return { status: 'past', startsInMin, endsInMin, start }
  if (startsInMin <= 0) return { status: 'live', startsInMin, endsInMin, start }
  if (startsInMin <= SOON_WINDOW_MIN) return { status: 'soon', startsInMin, endsInMin, start }
  if (jamaicaDate(start) === clock.isoDate) {
    return { status: 'today', startsInMin, endsInMin, start }
  }
  return { status: 'upcoming', startsInMin, endsInMin, start }
}

const inArea = (item, area) => area === 'all' || !area || item.area === area

/**
 * Build a Pulse snapshot for a parish (or the whole island).
 *
 * Falls back to island-wide results when the selected parish has nothing on,
 * so the strip is never an empty card.
 */
export function buildPulse({ places = [], events = [], area = 'all', now = new Date() } = {}) {
  const clock = jamaicaClock(now)

  const collect = (scope) => {
    const scopedEvents = events.filter((e) => inArea(e, scope))
    const scopedPlaces = places.filter((p) => inArea(p, scope))

    const timed = scopedEvents
      .map((event) => ({ event, timing: eventTiming(event, now, clock) }))
      .sort((a, b) => (a.timing.startsInMin ?? 0) - (b.timing.startsInMin ?? 0))

    const open = scopedPlaces
      .map((place) => ({ place, state: placeOpenState(place, clock) }))
      .filter((x) => x.state.open)
      .sort((a, b) => {
        // Surface venues closing soon first — they're the time-sensitive ones.
        const aSoon = a.state.closingSoon ? 0 : 1
        const bSoon = b.state.closingSoon ? 0 : 1
        if (aSoon !== bSoon) return aSoon - bSoon
        return (b.place.rating || 0) - (a.place.rating || 0)
      })

    return {
      live: timed.filter((x) => x.timing.status === 'live'),
      soon: timed.filter((x) => x.timing.status === 'soon'),
      today: timed.filter((x) => x.timing.status === 'today'),
      open,
    }
  }

  const scoped = collect(area)
  const scopedTotal =
    scoped.live.length + scoped.soon.length + scoped.today.length + scoped.open.length

  const usingFallback = area !== 'all' && Boolean(area) && scopedTotal === 0
  const buckets = usingFallback ? collect('all') : scoped

  return {
    clock,
    parish: area === 'all' ? null : area || null,
    islandWide: area === 'all' || !area || usingFallback,
    usingFallback,
    ...buckets,
    counts: {
      live: buckets.live.length,
      soon: buckets.soon.length,
      today: buckets.today.length,
      open: buckets.open.length,
    },
    total:
      buckets.live.length + buckets.soon.length + buckets.today.length + buckets.open.length,
    vibe: describeVibe(clock, buckets),
  }
}

/** One-line read on how busy the island is right now. */
function describeVibe(clock, buckets) {
  const onNow = buckets.live.length + buckets.soon.length
  if (onNow >= 4) return clock.isWeekend ? 'Peak weekend energy' : 'Busy for a weeknight'
  if (onNow >= 1) return clock.isWeekend ? 'Weekend building up' : 'Steady weeknight'
  if (clock.hour >= 1 && clock.hour < 6) return 'Island winding down'
  if (buckets.today.length > 0) return 'Quiet now, more later'
  return clock.isWeekend ? 'Weekend — plan ahead' : 'Quiet stretch'
}

/** Average coordinate of the places in scope — used for the weather lookup. */
export function areaCentroid(places, area = 'all') {
  const scoped = places.filter(
    (p) => inArea(p, area) && Number.isFinite(p.map?.lat) && Number.isFinite(p.map?.lng),
  )
  if (scoped.length === 0) return null
  const sum = scoped.reduce(
    (acc, p) => ({ lat: acc.lat + p.map.lat, lng: acc.lng + p.map.lng }),
    { lat: 0, lng: 0 },
  )
  return { lat: sum.lat / scoped.length, lng: sum.lng / scoped.length }
}
