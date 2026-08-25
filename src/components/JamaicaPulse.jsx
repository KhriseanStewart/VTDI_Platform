import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Check, CloudRain, DoorOpen, Plus, Radio, Sun, Timer } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { buildPulse, formatRelative } from '../lib/pulse'
import { outdoorAdvice } from '../lib/weather'
import { useNow, useParishWeather } from '../hooks/usePulse'
import { cn, ui } from '../lib/ui'

const WEATHER_TONE = {
  good: ui.pulseWeatherGood,
  ok: ui.pulseWeatherOk,
  poor: ui.pulseWeatherPoor,
}

/** Time-sensitive line for an event card. */
function eventWhen(timing) {
  if (timing.status === 'live') {
    const left = timing.endsInMin
    return {
      tone: ui.pulseWhenLive,
      icon: <Radio size={12} />,
      text: left > 0 && left < 600 ? `On now · ${formatRelative(left)} left` : 'On now',
    }
  }
  if (timing.status === 'soon') {
    return {
      tone: ui.pulseWhenSoon,
      icon: <Timer size={12} />,
      text: `Starts in ${formatRelative(timing.startsInMin)}`,
    }
  }
  return {
    tone: ui.pulseWhenMuted,
    icon: <Timer size={12} />,
    text:
      timing.startsInMin != null
        ? `Later today · in ${formatRelative(timing.startsInMin)}`
        : 'Later today',
  }
}

function PulseEventCard({ event, timing }) {
  const when = eventWhen(timing)
  return (
    <Link to={`/events/${event.id}`} className={ui.pulseCard}>
      <img src={event.image} alt="" className={ui.pulseCardImg} loading="lazy" />
      <span className="min-w-0 flex-1">
        <span className={ui.pulseCardTitle}>{event.title}</span>
        <span className={cn(ui.pulseCardMeta, 'block')}>
          {[event.venueName, event.area].filter(Boolean).join(' · ')}
        </span>
        <span className={cn(ui.pulseWhen, when.tone)}>
          {when.icon}
          {when.text}
        </span>
      </span>
    </Link>
  )
}

function PulsePlaceCard({ place, state }) {
  const { isInPlan, togglePlan } = useApp()
  const inPlan = isInPlan(place.id)

  const closing =
    state.closesAt && state.closingSoon
      ? `Closes ${state.closesAt}`
      : state.closesAt
        ? `Open until ${state.closesAt}`
        : 'Open now'

  return (
    <div className={ui.pulseCard}>
      <Link to={`/place/${place.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <img src={place.image} alt="" className={ui.pulseCardImg} loading="lazy" />
        <span className="min-w-0 flex-1">
          <span className={ui.pulseCardTitle}>{place.name}</span>
          <span className={cn(ui.pulseCardMeta, 'block')}>
            {[place.neighborhood, place.area].filter(Boolean).join(', ')}
          </span>
          <span
            className={cn(ui.pulseWhen, state.closingSoon ? ui.pulseWhenLive : ui.pulseWhenSoon)}
          >
            <DoorOpen size={12} />
            {closing}
          </span>
        </span>
      </Link>
      <button
        type="button"
        className={cn(ui.iconBtn, inPlan && 'text-primary')}
        onClick={() => togglePlan(place.id)}
        aria-label={inPlan ? `Remove ${place.name} from plan` : `Add ${place.name} to plan`}
        aria-pressed={inPlan}
      >
        {inPlan ? <Check size={16} /> : <Plus size={16} />}
      </button>
    </div>
  )
}

/**
 * Jamaica Pulse — a live read on what's actually on right now.
 *
 * Follows the caller's parish filter and falls back to island-wide results so
 * it never renders as an empty card.
 */
export default function JamaicaPulse({ places = [], events = [], area = 'all', compact = false }) {
  const now = useNow()
  const [tab, setTab] = useState('live')
  const weather = useParishWeather(places, area)

  const pulse = useMemo(
    () => buildPulse({ places, events, area, now }),
    [places, events, area, now],
  )

  const tabs = useMemo(
    () => [
      { key: 'live', label: 'On now', items: pulse.live, kind: 'event' },
      { key: 'soon', label: 'Next 2 hrs', items: pulse.soon, kind: 'event' },
      { key: 'open', label: 'Open now', items: pulse.open, kind: 'place' },
      { key: 'today', label: 'Later today', items: pulse.today, kind: 'event' },
    ],
    [pulse],
  )

  const available = tabs.filter((t) => t.items.length > 0)
  // Derive the shown tab so a selection never sticks on an emptied bucket.
  const active = available.find((t) => t.key === tab) || available[0] || null

  const scopeLabel = pulse.parish && !pulse.usingFallback ? pulse.parish : 'across Jamaica'
  const advice = outdoorAdvice(weather, pulse.parish || 'Jamaica')

  return (
    <section className={ui.pulsePanel} aria-label="Jamaica Pulse">
      <div className={ui.pulseHead}>
        <div className="min-w-0">
          <h2 className={ui.pulseTitle}>
            <span className={ui.pulseLive} aria-hidden />
            Jamaica Pulse
          </h2>
          <p className={ui.pulseScope}>
            {pulse.clock.dayLong} {pulse.clock.partOfDay} · {pulse.clock.clock} in {scopeLabel}
          </p>
        </div>
        <span className={ui.pulseVibe}>
          <Activity size={13} />
          {pulse.vibe}
        </span>
      </div>

      {advice && (
        <p className={cn(ui.pulseWeather, WEATHER_TONE[advice.tone])}>
          {advice.tone === 'poor' ? <CloudRain size={15} /> : <Sun size={15} />}
          <span className="min-w-0 flex-1">{advice.text}</span>
          {weather?.tempC != null && (
            <span className="shrink-0 font-bold tabular-nums">{weather.tempC}°C</span>
          )}
        </p>
      )}

      {available.length === 0 ? (
        <p className={ui.pulseEmpty}>
          Nothing scheduled on the island right now — browse places below, or check the events
          calendar for what&apos;s next.
        </p>
      ) : (
        <>
          <div className={ui.pulseTabs} role="tablist" aria-label="Pulse filters">
            {available.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active?.key === t.key}
                className={cn(ui.pulseTab, active?.key === t.key && ui.pulseTabActive)}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                <span className={ui.pulseTabCount}>{t.items.length}</span>
              </button>
            ))}
          </div>

          <div className={ui.pulseRail} role="tabpanel">
            {active.kind === 'event'
              ? active.items
                  .slice(0, compact ? 6 : 12)
                  .map(({ event, timing }) => (
                    <PulseEventCard key={event.id} event={event} timing={timing} />
                  ))
              : active.items
                  .slice(0, compact ? 6 : 12)
                  .map(({ place, state }) => (
                    <PulsePlaceCard key={place.id} place={place} state={state} />
                  ))}
          </div>
        </>
      )}

      {pulse.usingFallback && (
        <p className={ui.pulseNote}>
          Nothing on in {area} right now — showing what&apos;s live island-wide.
        </p>
      )}
    </section>
  )
}
