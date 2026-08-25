import {
  parseClock,
  formatMinutes,
  formatRelative,
  jamaicaClock,
  placeOpenState,
  eventTiming,
  buildPulse,
} from '../src/lib/pulse.js'

let pass = 0
let fail = 0
const eq = (label, actual, expected) => {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    pass++
  } else {
    fail++
    console.log(`FAIL ${label}\n  expected ${e}\n  actual   ${a}`)
  }
}

// ---- clock parsing
eq('parse 4:00 PM', parseClock('4:00 PM'), 16 * 60)
eq('parse 12:00 AM', parseClock('12:00 AM'), 0)
eq('parse 12:00 PM', parseClock('12:00 PM'), 720)
eq('parse 11:59 PM', parseClock('11:59 PM'), 1439)
eq('parse 24h 16:00', parseClock('16:00'), 960)
eq('parse 7:30 AM', parseClock('7:30 AM'), 450)
eq('parse junk', parseClock('nope'), null)
eq('format 960', formatMinutes(960), '4:00 PM')
eq('format 0', formatMinutes(0), '12:00 AM')
eq('relative 45', formatRelative(45), '45 min')
eq('relative 120', formatRelative(120), '2 hr')
eq('relative 95', formatRelative(95), '1 hr 35 min')

// ---- Jamaica clock is UTC-5, no DST (check both summer and winter)
// 2026-08-24T18:00Z -> 1:00 PM Jamaica, Monday
const summer = jamaicaClock(new Date('2026-08-24T18:00:00Z'))
eq('summer day', summer.day, 'Mon')
eq('summer minutes', summer.minutes, 13 * 60)
// 2026-01-12T18:00Z -> 1:00 PM Jamaica (no DST shift)
eq('winter minutes', jamaicaClock(new Date('2026-01-12T18:00:00Z')).minutes, 13 * 60)
// 2026-08-25T03:30Z -> 10:30 PM Monday Jamaica (previous local day)
const rollback = jamaicaClock(new Date('2026-08-25T03:30:00Z'))
eq('rollback day', rollback.day, 'Mon')
eq('rollback minutes', rollback.minutes, 22 * 60 + 30)
eq('rollback isoDate', rollback.isoDate, '2026-08-24')
// midnight must be hour 0, not 24
const midnight = jamaicaClock(new Date('2026-08-25T05:10:00Z'))
eq('midnight hour', midnight.hour, 0)
eq('midnight minutes', midnight.minutes, 10)
eq('weekend flag Fri', jamaicaClock(new Date('2026-08-28T18:00:00Z')).isWeekend, true)
eq('weekend flag Mon', summer.isWeekend, false)

// ---- open-now from hours
const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const stdHours = (open, close, closedDays = []) =>
  WEEK.map((day) => ({ day, open, close, closed: closedDays.includes(day) }))

const clockAt = (day, minutes) => ({
  day,
  dayLong: day,
  hour: Math.floor(minutes / 60),
  minutes,
  isoDate: '2026-08-24',
  isWeekend: false,
  partOfDay: 'x',
  clock: formatMinutes(minutes),
})

const cafe = { hours: stdHours('7:30 AM', '6:00 PM', ['Sun']) }
eq('cafe open 10am', placeOpenState(cafe, clockAt('Mon', 600)).open, true)
eq('cafe closed 7am', placeOpenState(cafe, clockAt('Mon', 420)).open, false)
eq('cafe opens in', placeOpenState(cafe, clockAt('Mon', 420)).opensInMin, 30)
eq('cafe closed 7pm', placeOpenState(cafe, clockAt('Mon', 1140)).open, false)
eq('cafe closed Sunday noon', placeOpenState(cafe, clockAt('Sun', 720)).open, false)
eq('cafe closing soon 5:15pm', placeOpenState(cafe, clockAt('Mon', 1035)).closingSoon, true)
eq('cafe not closing soon noon', placeOpenState(cafe, clockAt('Mon', 720)).closingSoon, false)

// overnight venue: 11:00 AM -> 2:00 AM
const club = { hours: stdHours('11:00 AM', '2:00 AM') }
eq('club open 11pm', placeOpenState(club, clockAt('Fri', 23 * 60)).open, true)
eq('club open 1am', placeOpenState(club, clockAt('Sat', 60)).open, true)
eq('club 1am closes in', placeOpenState(club, clockAt('Sat', 60)).closesInMin, 60)
eq('club closed 3am', placeOpenState(club, clockAt('Sat', 180)).open, false)
eq('club closed 10am', placeOpenState(club, clockAt('Sat', 600)).open, false)
eq('club 11pm closes in', placeOpenState(club, clockAt('Fri', 23 * 60)).closesInMin, 180)

// closed today, but last night's overnight window is still running
const closedMon = { hours: stdHours('4:00 PM', '2:00 AM', ['Mon']) }
eq('tail open Mon 1am', placeOpenState(closedMon, clockAt('Mon', 60)).open, true)
eq('tail closed Mon 3pm', placeOpenState(closedMon, clockAt('Mon', 900)).open, false)
eq('tail closed Mon 8pm', placeOpenState(closedMon, clockAt('Mon', 1200)).open, false)

// no hours -> fall back to the stored flag
eq('flag fallback true', placeOpenState({ openNow: true, hours: [] }, clockAt('Mon', 600)), {
  open: true,
  source: 'flag',
})
eq('flag fallback false', placeOpenState({ openNow: false }, clockAt('Mon', 600)).open, false)

// beach open 12:00 AM -> 11:59 PM (effectively all day)
const beach = { hours: stdHours('12:00 AM', '11:59 PM') }
eq('beach open noon', placeOpenState(beach, clockAt('Wed', 720)).open, true)
eq('beach open 6am', placeOpenState(beach, clockAt('Wed', 360)).open, true)

// ---- event timing buckets
const now = new Date('2026-08-24T22:00:00Z') // 5:00 PM Jamaica, Monday
const ev = (startsAt, endsAt) => ({ startsAt, endsAt })
eq(
  'event live',
  eventTiming(ev('2026-08-24T21:00:00Z', '2026-08-25T02:00:00Z'), now).status,
  'live',
)
eq('event soon 90min', eventTiming(ev('2026-08-24T23:30:00Z'), now).status, 'soon')
eq('event soon startsIn', eventTiming(ev('2026-08-24T23:30:00Z'), now).startsInMin, 90)
eq('event boundary 120min', eventTiming(ev('2026-08-25T00:00:00Z'), now).status, 'soon')
eq('event beyond 121min', eventTiming(ev('2026-08-25T00:01:00Z'), now).status, 'today')
eq('event past', eventTiming(ev('2026-08-24T10:00:00Z', '2026-08-24T14:00:00Z'), now).status, 'past')
eq('event future day', eventTiming(ev('2026-08-30T22:00:00Z'), now).status, 'upcoming')
// no end time -> assumed 3h run
eq('event no end still live', eventTiming(ev('2026-08-24T20:30:00Z'), now).status, 'live')
eq('event no end expired', eventTiming(ev('2026-08-24T18:00:00Z'), now).status, 'past')
// missing startsAt must not crash
eq('event no start', eventTiming({ date: 'Aug 30, 2026' }, now).status, 'upcoming')

// "today" must use Jamaica-local date, not UTC date.
// 2026-08-25T01:00Z is Aug 24 8:00 PM Jamaica -> same local day as `now`.
eq('event late today local', eventTiming(ev('2026-08-25T01:00:00Z'), now).status, 'today')
// 2026-08-25T06:00Z is Aug 25 1:00 AM Jamaica -> next local day.
eq('event next local day', eventTiming(ev('2026-08-25T06:00:00Z'), now).status, 'upcoming')

// ---- buildPulse scoping and fallback
const places = [
  { id: 'p1', area: 'Kingston', rating: 4.5, hours: stdHours('7:30 AM', '6:00 PM'), map: { lat: 18, lng: -76.8 } },
  { id: 'p2', area: 'Kingston', rating: 4.9, hours: stdHours('4:00 PM', '2:00 AM'), map: { lat: 18.01, lng: -76.79 } },
  { id: 'p3', area: 'Westmoreland', rating: 4.2, hours: stdHours('11:00 AM', '10:00 PM'), map: { lat: 18.3, lng: -78.3 } },
]
const events = [
  { id: 'e1', area: 'Kingston', startsAt: '2026-08-24T21:00:00Z', endsAt: '2026-08-25T02:00:00Z' },
  { id: 'e2', area: 'Kingston', startsAt: '2026-08-24T23:00:00Z' },
  { id: 'e3', area: 'St. Ann', startsAt: '2026-08-24T23:30:00Z' },
]

const island = buildPulse({ places, events, area: 'all', now })
eq('island live', island.counts.live, 1)
eq('island soon', island.counts.soon, 2)
eq('island open (5pm)', island.counts.open, 3)
eq('island islandWide', island.islandWide, true)
eq('island no fallback', island.usingFallback, false)

const kingston = buildPulse({ places, events, area: 'Kingston', now })
eq('kingston live', kingston.counts.live, 1)
eq('kingston soon', kingston.counts.soon, 1)
eq('kingston open', kingston.counts.open, 2)
eq('kingston parish', kingston.parish, 'Kingston')
eq('kingston not fallback', kingston.usingFallback, false)

// a parish with nothing at all must fall back to island-wide, never empty
const empty = buildPulse({ places, events, area: 'Portland', now })
eq('portland fallback', empty.usingFallback, true)
eq('portland islandWide', empty.islandWide, true)
eq('portland has content', empty.total > 0, true)

// closing-soon venues sort ahead of higher-rated ones
const sorted = buildPulse({ places, events, area: 'Kingston', now: new Date('2026-08-24T22:30:00Z') })
eq('closing soon first', sorted.open[0].place.id, 'p1')

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
