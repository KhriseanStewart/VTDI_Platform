/** Event schedule helpers (America/Jamaica). */

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
