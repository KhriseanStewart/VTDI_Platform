import {
  parseMoney,
  formatJmd,
  formatBand,
  roundMoney,
  clampPartySize,
  estimateStop,
  estimateEvent,
  estimatePlan,
  USD_TO_JMD,
} from '../src/lib/costs.js'

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

// ---- formatting
eq('format 12400', formatJmd(12400), 'J$12,400')
eq('format 0', formatJmd(0), 'J$0')
eq('format negative clamps', formatJmd(-5), 'J$0')
eq('round 1234 -> 1200', roundMoney(1234), 1200)
eq('round 1250 -> 1300', roundMoney(1250), 1300)
eq('round char under 1000', roundMoney(725), 750)
eq('round large to 500s', roundMoney(23400), 23500)
eq('band collapses', formatBand(3000, 3000), 'J$3,000')
eq('band spread', formatBand(2100, 4800), 'J$2,100 – J$4,800')
eq('band free', formatBand(0, 0), 'Free')

// ---- party size clamping
eq('party 3', clampPartySize(3), 3)
eq('party 0 -> 1', clampPartySize(0), 1)
eq('party -4 -> 1', clampPartySize(-4), 1)
eq('party 999 -> 20', clampPartySize(999), 20)
eq('party junk -> 1', clampPartySize('abc'), 1)
eq('party float rounds', clampPartySize(2.6), 3)

// ---- price string parsing (shapes that exist in the catalog)
eq('free', parseMoney('Free'), {
  low: 0,
  high: 0,
  free: true,
  conditional: false,
  currency: 'JMD',
  known: true,
})
eq('free entry', parseMoney('Free entry').free, true)
eq('free entry not conditional', parseMoney('Free entry').conditional, false)
eq('free before 7pm is free', parseMoney('Free before 7 PM').free, true)
eq('free before 7pm conditional', parseMoney('Free before 7 PM').conditional, true)
// the "7" in "7 PM" must not be read as a price
eq('free before 7pm amount', parseMoney('Free before 7 PM').low, 0)
eq('free before 10pm amount', parseMoney('Free before 10 PM').high, 0)
eq('jmd with entry suffix', parseMoney('J$2,000 entry').low, 2000)
eq('jmd plain', parseMoney('J$3,500').high, 3500)
eq('jmd no symbol', parseMoney('2500').low, 2500)
eq('range en dash', parseMoney('J$2,000–3,000'), {
  low: 2000,
  high: 3000,
  free: false,
  conditional: false,
  currency: 'JMD',
  known: true,
})
eq('range hyphen spaced', parseMoney('J$2,000 - 3,000').high, 3000)
eq('range reversed normalises', parseMoney('J$3,000 - 2,000').low, 2000)
eq('range "to"', parseMoney('1,000 to 2,000').high, 2000)
eq('usd converts', parseMoney('US$25').low, 25 * USD_TO_JMD)
eq('usd currency flagged', parseMoney('US$25').currency, 'USD')
eq('usd lowercase', parseMoney('usd 25').low, 25 * USD_TO_JMD)
eq('jmd not misread as usd', parseMoney('J$25').currency, 'JMD')
eq('unknown string', parseMoney('Ask at the gate').known, false)
eq('empty', parseMoney('').known, false)
eq('null', parseMoney(null).known, false)
eq('undefined', parseMoney(undefined).known, false)

// ---- stop estimates
// price_range carries a real JMD figure; legacy tiers 1-4 map to 1000-4000.
const bar = { id: 'b', name: 'Bar', category: 'bar', priceRange: 3 } // -> 3000
const barEst = estimateStop(bar)
eq('bar source', barEst.source, 'venue')
eq('bar center', barEst.center, 3000)
eq('bar low', barEst.low, roundMoney(3000 * 0.7))
eq('bar high', barEst.high, roundMoney(3000 * 1.9))

// an explicit JMD amount is used as-is
eq('explicit amount center', estimateStop({ category: 'restaurant', priceRange: 7500 }).center, 7500)

// missing price_range must NOT silently become PRICE_MIN; use the category default
const noPrice = estimateStop({ id: 'x', category: 'attraction' })
eq('missing price -> category', noPrice.source, 'category')
eq('missing price uses profile centre', noPrice.center, 4500)
eq('zero price -> category', estimateStop({ category: 'cafe', priceRange: 0 }).source, 'category')
eq('null price -> category', estimateStop({ category: 'cafe', priceRange: null }).source, 'category')
eq('unknown category falls back', estimateStop({ category: 'spaceport' }).center, 2500)
eq('no place at all', estimateStop(undefined).source, 'category')

// band width reflects category volatility: bars vary more than cinemas
const barSpread = barEst.high - barEst.low
const movieEst = estimateStop({ category: 'movies', priceRange: 3 })
eq('bar band wider than cinema', barSpread > movieEst.high - movieEst.low, true)
eq('low never exceeds high', estimateStop({ category: 'beach', priceRange: 1 }).low <= estimateStop({ category: 'beach', priceRange: 1 }).high, true)

// ---- event estimates
eq('event free', estimateEvent({ price: 'Free' }).free, true)
eq('event priced', estimateEvent({ price: 'J$3,500' }).low, 3500)
eq('event unknown', estimateEvent({ price: 'TBA' }).known, false)
eq('event missing price', estimateEvent({}).known, false)
eq('event usd flagged as converted', estimateEvent({ price: 'US$25' }).converted, true)
eq('event jmd not converted', estimateEvent({ price: 'J$3,500' }).converted, false)

// ---- whole-plan math
const stops = [
  { id: 'p1', name: 'Cafe', category: 'cafe', priceRange: 2 }, // 2000
  { id: 'p2', name: 'Restaurant', category: 'restaurant', priceRange: 3 }, // 3000
  { id: 'p3', name: 'Bar', category: 'bar', priceRange: 3 }, // 3000
]
const plan = estimatePlan(stops, { partySize: 3 })
const expectLow = roundMoney(2000 * 0.7) + roundMoney(3000 * 0.7) + roundMoney(3000 * 0.7)
const expectHigh = roundMoney(2000 * 1.5) + roundMoney(3000 * 1.7) + roundMoney(3000 * 1.9)
eq('plan per-person low', plan.perPerson.low, expectLow)
eq('plan per-person high', plan.perPerson.high, expectHigh)
eq('plan per-person mid', plan.perPerson.mid, Math.round((expectLow + expectHigh) / 2))
eq('group scales by party', plan.group.mid, plan.perPerson.mid * 3)
eq('group low scales', plan.group.low, expectLow * 3)
eq('plan confidence high', plan.confidence, 'high')
eq('plan party recorded', plan.partySize, 3)
eq('plan stop count', plan.stops.length, 3)
eq('plan no category fallbacks', plan.estimatedStops, 0)

// mixed sources are reported honestly
const mixed = estimatePlan([...stops, { id: 'p4', category: 'beach' }], { partySize: 2 })
eq('mixed confidence', mixed.confidence, 'mixed')
eq('mixed counts fallbacks', mixed.estimatedStops, 1)

const allDefaults = estimatePlan([{ id: 'a', category: 'beach' }], { partySize: 1 })
eq('all-default confidence low', allDefaults.confidence, 'low')

// empty and defensive cases
const empty = estimatePlan([], { partySize: 4 })
eq('empty confidence', empty.confidence, 'none')
eq('empty per person', empty.perPerson.mid, 0)
eq('empty group', empty.group.mid, 0)
eq('nulls filtered', estimatePlan([null, undefined], { partySize: 2 }).stops.length, 0)
eq('party defaults to 1', estimatePlan(stops).partySize, 1)
eq('party clamped in plan', estimatePlan(stops, { partySize: 500 }).partySize, 20)

// ---- budget check
const under = estimatePlan(stops, { partySize: 2, budget: 100000 })
eq('under budget not over', under.budget.over, false)
eq('under budget not on track', under.budget.onTrack, false)
const over = estimatePlan(stops, { partySize: 4, budget: 1000 })
eq('over budget flagged', over.budget.over, true)
const onTarget = estimatePlan(stops, { partySize: 3, budget: plan.group.mid })
eq('exact budget on track', onTarget.budget.onTrack, true)
eq('exact budget diff', onTarget.budget.diff, 0)
const near = estimatePlan(stops, { partySize: 3, budget: Math.round(plan.group.mid * 1.05) })
eq('within 10% on track', near.budget.onTrack, true)
eq('no budget -> null', estimatePlan(stops, { partySize: 3 }).budget, null)
eq('zero budget -> null', estimatePlan(stops, { partySize: 3, budget: 0 }).budget, null)

// ---- pitch example sanity: a 3-person night lands in a believable range
const night = estimatePlan(stops, { partySize: 3 })
eq(
  'headline plausible',
  night.group.mid > 15000 && night.group.mid < 60000,
  true,
)

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
