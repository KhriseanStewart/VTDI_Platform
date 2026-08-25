// jmd outing estimates — not checkout prices.
// sources: venue (price_range), event (parsed price), category (fallback)

// needed for the verify script under plain node
import { normalizePriceRange } from '../data/outyahData.js'

/** rough usd → jmd for the odd us-priced event */
export const USD_TO_JMD = 158

// fallback spend + band width per category (bars swing more than cinema)
const CATEGORY_COST = {
  restaurant: { center: 3500, low: 0.7, high: 1.7, note: 'food and drinks' },
  bar: { center: 4000, low: 0.7, high: 1.9, note: 'drinks and cover' },
  cafe: { center: 1500, low: 0.7, high: 1.5, note: 'coffee and a bite' },
  movies: { center: 2000, low: 0.9, high: 1.3, note: 'ticket and snacks' },
  gaming: { center: 2500, low: 0.8, high: 1.6, note: 'session time' },
  beach: { center: 1500, low: 0.4, high: 1.6, note: 'entry, food and drinks' },
  attraction: { center: 4500, low: 0.8, high: 1.5, note: 'entry and extras' },
}

const DEFAULT_COST = { center: 2500, low: 0.7, high: 1.6, note: 'typical spend' }

const MAX_PARTY_SIZE = 20

/** round to something you'd actually say out loud */
export function roundMoney(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return 0
  if (amount < 1000) return Math.round(amount / 50) * 50
  if (amount < 20000) return Math.round(amount / 100) * 100
  return Math.round(amount / 500) * 500
}

/** 12400 → "J$12,400" */
export function formatJmd(amount) {
  const value = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0
  return `J$${value.toLocaleString('en-US')}`
}

/** "J$2,100 – J$4,800" or a single figure when both ends match */
export function formatBand(low, high) {
  if (!Number.isFinite(low) || !Number.isFinite(high)) return '—'
  if (low <= 0 && high <= 0) return 'Free'
  if (roundMoney(low) === roundMoney(high)) return formatJmd(low)
  return `${formatJmd(low)} – ${formatJmd(high)}`
}

/** keep party size sane for the stepper */
export function clampPartySize(value) {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return 1
  return Math.min(MAX_PARTY_SIZE, Math.max(1, n))
}

const NUMBER = String.raw`\d[\d,]*(?:\.\d+)?`

/** turn "Free", "J$2,000 entry", "US$25", "J$2,000–3,000" etc into jmd */
export function parseMoney(input) {
  const unknown = {
    low: 0,
    high: 0,
    free: false,
    conditional: false,
    currency: 'JMD',
    known: false,
  }
  if (typeof input !== 'string') return unknown

  const text = input.trim()
  if (!text) return unknown

  const isFree = /\bfree\b/i.test(text)
  // "free before 7pm" isn't fully free
  const conditional = isFree && /\b(before|until|till|til|after|with)\b/i.test(text)

  // check usd before plain $ — "US$" contains $
  const currency = /\b(us\$|usd)/i.test(text) ? 'USD' : 'JMD'
  const rate = currency === 'USD' ? USD_TO_JMD : 1

  const range = text.match(new RegExp(`(${NUMBER})\\s*(?:-|–|—|to)\\s*(${NUMBER})`, 'i'))
  if (range) {
    const low = toNumber(range[1]) * rate
    const high = toNumber(range[2]) * rate
    return {
      low: Math.min(low, high),
      high: Math.max(low, high),
      free: false,
      conditional: false,
      currency,
      known: true,
    }
  }

  // strip clock times so "7 pm" doesn't become J$7
  const cleaned = text.replace(/\b\d{1,2}(:\d{2})?\s*(am|pm)\b/gi, ' ')
  const single = cleaned.match(new RegExp(NUMBER))
  if (single) {
    const amount = toNumber(single[0]) * rate
    if (amount > 0) {
      return {
        low: amount,
        high: amount,
        free: false,
        conditional: false,
        currency,
        known: true,
      }
    }
  }

  if (isFree) {
    return { low: 0, high: 0, free: true, conditional, currency, known: true }
  }

  return unknown
}

function toNumber(raw) {
  const n = Number(String(raw).replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

/** per-person spend for one plan stop */
export function estimateStop(place) {
  const profile = CATEGORY_COST[place?.category] || DEFAULT_COST

  // normalizePriceRange() bumps missing to PRICE_MIN — check raw so "no data" ≠ "cheap"
  const raw = Number(place?.priceRange)
  const hasVenueFigure = Number.isFinite(raw) && raw > 0
  const center = hasVenueFigure ? normalizePriceRange(raw) : profile.center

  return {
    placeId: place?.id,
    name: place?.name,
    category: place?.category,
    low: roundMoney(center * profile.low),
    high: roundMoney(center * profile.high),
    center: roundMoney(center),
    source: hasVenueFigure ? 'venue' : 'category',
    note: profile.note,
  }
}

/** per-person entry from an event's price string */
export function estimateEvent(event) {
  const parsed = parseMoney(event?.price)
  return {
    low: roundMoney(parsed.low),
    high: roundMoney(parsed.high),
    free: parsed.free,
    conditional: parsed.conditional,
    known: parsed.known,
    converted: parsed.currency === 'USD',
    source: 'event',
  }
}

/** full plan total — per person, group, and optional budget check */
export function estimatePlan(places = [], { partySize = 1, budget = null } = {}) {
  const size = clampPartySize(partySize)
  const stops = places.filter(Boolean).map(estimateStop)

  const perPersonLow = stops.reduce((sum, s) => sum + s.low, 0)
  const perPersonHigh = stops.reduce((sum, s) => sum + s.high, 0)
  const perPersonMid = Math.round((perPersonLow + perPersonHigh) / 2)

  const sources = new Set(stops.map((s) => s.source))
  const confidence =
    stops.length === 0
      ? 'none'
      : sources.size > 1
        ? 'mixed'
        : sources.has('venue')
          ? 'high'
          : 'low'

  const groupMid = perPersonMid * size
  const estimatedStops = stops.filter((s) => s.source === 'category').length

  return {
    stops,
    partySize: size,
    perPerson: { low: perPersonLow, high: perPersonHigh, mid: perPersonMid },
    group: {
      low: perPersonLow * size,
      high: perPersonHigh * size,
      mid: groupMid,
    },
    confidence,
    estimatedStops,
    budget: budget != null ? buildBudgetCheck(groupMid, budget) : null,
  }
}

function buildBudgetCheck(groupMid, budget) {
  const target = Number(budget)
  if (!Number.isFinite(target) || target <= 0) return null
  const diff = groupMid - target
  const ratio = groupMid / target
  return {
    target,
    diff,
    over: diff > 0,
    // within 10% counts as on budget
    onTrack: Math.abs(ratio - 1) <= 0.1,
  }
}
