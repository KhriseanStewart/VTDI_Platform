/** Event schedule helpers (America/Jamaica). */

import { JAMAICA_TZ } from './pulse.js'

const jmDateLabel = new Intl.DateTimeFormat('en-US', {
  timeZone: JAMAICA_TZ,
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

const jmClock = new Intl.DateTimeFormat('en-US', {
  timeZone: JAMAICA_TZ,
  hour: 'numeric',
  minute: '2-digit',
})

const jmDateInput = new Intl.DateTimeFormat('en-CA', {
  timeZone: JAMAICA_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const jmTimeParts = new Intl.DateTimeFormat('en-US', {
  timeZone: JAMAICA_TZ,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** "Sat, Aug 22" in Jamaica local time */
export function formatEventDateLabel(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return jmDateLabel.format(d)
}

/** "4:00 PM" in Jamaica local time */
export function formatEventClock(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return jmClock.format(d)
}

/** card-friendly time string, e.g. "4:00 PM" or "4:00 PM – 11:00 PM" */
export function formatEventTimeLabel(startIso, endIso) {
  if (!startIso) return ''
  const startClock = formatEventClock(startIso)
  if (!endIso) return startClock

  const startDay = formatEventDateLabel(startIso)
  const endDay = formatEventDateLabel(endIso)
  const endClock = formatEventClock(endIso)

  if (startDay === endDay) {
    return startClock === endClock ? startClock : `${startClock} – ${endClock}`
  }
  return `${startClock} – ${endDay}, ${endClock}`
}

/** display labels stored on the event row */
export function labelsFromSchedule(startIso, endIso) {
  return {
    date: formatEventDateLabel(startIso),
    time: formatEventTimeLabel(startIso, endIso),
  }
}

/** split an iso timestamp into `<input type="date">` and `<input type="time">` parts (jm) */
export function splitSchedule(iso) {
  if (!iso) return { date: '', time: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { date: '', time: '' }

  const date = jmDateInput.format(d)
  const parts = Object.fromEntries(jmTimeParts.formatToParts(d).map((p) => [p.type, p.value]))
  const hour = String(Number(parts.hour) % 24).padStart(2, '0')
  const minute = String(parts.minute).padStart(2, '0')
  return { date, time: `${hour}:${minute}` }
}

/** join date + time fields into an iso string (jamaica, utc−5) */
export function joinSchedule(date, time) {
  if (!date || !time) return null
  const d = new Date(`${date}T${time}:00-05:00`)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/** default end = start + 3 hours */
export function defaultEndSchedule(startDate, startTime) {
  const startIso = joinSchedule(startDate, startTime)
  if (!startIso) return { endDate: '', endTime: '' }
  const end = new Date(startIso)
  end.setHours(end.getHours() + 3)
  return splitSchedule(end.toISOString())
}

export function eventStatus(event, now = new Date()) {
  const start = event.startsAt ? new Date(event.startsAt) : null
  const end = event.endsAt ? new Date(event.endsAt) : start

  if (start && !Number.isNaN(start.getTime())) {
    const endAt = end && !Number.isNaN(end.getTime()) ? end : start
    if (now > endAt) return 'past'
    if (now >= start && now <= endAt) return 'live'
    return 'upcoming'
  }

  // Fallback: parse loose labels like "Aug 6, 2026"
  if (event.date) {
    const parsed = Date.parse(event.date)
    if (!Number.isNaN(parsed)) {
      const dayEnd = new Date(parsed)
      dayEnd.setHours(23, 59, 59, 999)
      if (now > dayEnd) return 'past'
      return 'upcoming'
    }
  }

  return 'upcoming'
}

export function eventStatusLabel(status) {
  if (status === 'past') return 'Past'
  if (status === 'live') return 'Happening now'
  return 'Upcoming'
}

export function sortEvents(events, now = new Date()) {
  const rank = { live: 0, upcoming: 1, past: 2 }
  return [...events].sort((a, b) => {
    const sa = eventStatus(a, now)
    const sb = eventStatus(b, now)
    if (rank[sa] !== rank[sb]) return rank[sa] - rank[sb]
    const ta = a.startsAt ? new Date(a.startsAt).getTime() : 0
    const tb = b.startsAt ? new Date(b.startsAt).getTime() : 0
    if (sa === 'past') return tb - ta
    return ta - tb
  })
}
