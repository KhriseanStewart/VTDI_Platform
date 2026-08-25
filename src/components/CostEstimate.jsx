import { useMemo } from 'react'
import { Minus, Plus, Wallet } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { estimatePlan, formatBand, formatJmd } from '../lib/costs'
import { cn, ui } from '../lib/ui'

function PartySizeStepper({ value, onChange }) {
  return (
    <div className={ui.stepper}>
      <button
        type="button"
        className={ui.stepperBtn}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Fewer people"
      >
        <Minus size={14} />
      </button>
      <span className={ui.stepperValue} aria-hidden>
        {value}
      </span>
      <button
        type="button"
        className={ui.stepperBtn}
        onClick={() => onChange(value + 1)}
        disabled={value >= 20}
        aria-label="More people"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}

/**
 * Estimated outing cost in JMD, per person and for the group.
 *
 * Deliberately labelled as an estimate: figures come from each venue's typical
 * spend, falling back to category averages, and are never a checkout price.
 */
export default function CostEstimate({
  places = [],
  budget = null,
  title = 'Outing cost',
  showBreakdown = true,
  editableParty = true,
}) {
  const { partySize, setPartySize } = useApp()

  const estimate = useMemo(
    () => estimatePlan(places, { partySize, budget }),
    [places, partySize, budget],
  )

  if (estimate.stops.length === 0) return null

  const { perPerson, group, stops, estimatedStops } = estimate
  const people = estimate.partySize

  return (
    <section className={cn(ui.cardPanel, 'flex flex-col gap-3.5')} aria-label={title}>
      <div className={ui.costHead}>
        <h2 className={cn(ui.h3, 'inline-flex items-center gap-2')}>
          <Wallet size={16} className="text-primary" />
          {title}
        </h2>
        <span className={ui.costTag}>Estimate</span>
      </div>

      <div>
        <p className={ui.costHeadline} aria-live="polite">
          {formatJmd(group.mid)}
        </p>
        <p className={ui.costSub}>
          for {people} {people === 1 ? 'person' : 'people'}
          {people > 1 && <> · about {formatJmd(perPerson.mid)} each</>}
        </p>
      </div>

      {editableParty && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-[0.86rem] font-semibold">Party size</span>
          <PartySizeStepper value={people} onChange={setPartySize} />
        </div>
      )}

      {estimate.budget && (
        <p
          className={cn(
            'rounded-xl px-3 py-2 text-[0.82rem] font-semibold',
            estimate.budget.onTrack
              ? 'bg-primary-soft text-primary'
              : estimate.budget.over
                ? 'bg-danger-soft text-danger'
                : 'bg-primary-soft text-primary',
          )}
        >
          {estimate.budget.onTrack
            ? `On budget — target was ${formatJmd(estimate.budget.target)}`
            : estimate.budget.over
              ? `${formatJmd(estimate.budget.diff)} over your ${formatJmd(estimate.budget.target)} budget`
              : `${formatJmd(-estimate.budget.diff)} under your ${formatJmd(estimate.budget.target)} budget`}
        </p>
      )}

      {showBreakdown && (
        <>
          <div className={ui.divider} />
          <ul className="m-0 grid list-none gap-2 p-0">
            {stops.map((stop) => (
              <li key={stop.placeId} className={ui.costRow}>
                <span className={ui.costRowName}>
                  {stop.name}
                  {stop.source === 'category' && (
                    <span className="ml-1 text-subtle" title="Category average — venue has no spend figure">
                      *
                    </span>
                  )}
                </span>
                <span className={ui.costRowValue}>{formatBand(stop.low, stop.high)}</span>
              </li>
            ))}
            <li className={cn(ui.costRow, 'border-t border-border pt-2 font-bold')}>
              <span>Per person</span>
              <span className={ui.costRowValue}>
                {formatBand(perPerson.low, perPerson.high)}
              </span>
            </li>
          </ul>
        </>
      )}

      <p className={ui.costFoot}>
        Estimate only — not a checkout price. Based on each venue&apos;s typical spend
        {estimatedStops > 0 && (
          <>
            {' '}
            (* {estimatedStops} {estimatedStops === 1 ? 'stop uses' : 'stops use'} a category
            average)
          </>
        )}
        . Pay at the venue.
      </p>
    </section>
  )
}
