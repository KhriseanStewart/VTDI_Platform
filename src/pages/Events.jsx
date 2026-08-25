import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CalendarDays,
  MapPin,
  Ticket,
  SearchX,
  RefreshCw,
  ArrowLeft,
  Share2,
  Users,
  Wallet,
  Check,
  Bookmark,
} from 'lucide-react'
import EventCard from '../components/EventCard'
import EmptyState from '../components/EmptyState'
import EventChat from '../components/EventChat'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useEventRsvp } from '../hooks/useEventChat'
import { estimateEvent, formatJmd } from '../lib/costs'
import { eventStatus, eventStatusLabel, sortEvents } from '../lib/events'
import { eventTiming, jamaicaClock } from '../lib/pulse'
import { useNow } from '../hooks/usePulse'
import { shareReel } from '../lib/reelMeta'
import { btn, cn, ui } from '../lib/ui'

const WEEKEND_DAYS = new Set(['Fri', 'Sat', 'Sun'])

/** Tonight lives here as a filter, not as a separate destination. */
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'tonight', label: 'Tonight' },
  { key: 'weekend', label: 'This weekend' },
  { key: 'recurring', label: 'Recurring' },
  { key: 'past', label: 'Past' },
]

export function Events() {
  const { events, loading, error, refresh } = useData()
  const { isAdmin } = useAuth()
  const [filter, setFilter] = useState('all')
  const now = useNow()

  const sorted = useMemo(() => sortEvents(events, now), [events, now])

  const timings = useMemo(() => {
    const clock = jamaicaClock(now)
    const map = new Map()
    for (const event of events) map.set(event.id, eventTiming(event, now, clock))
    return map
  }, [events, now])

  const buckets = useMemo(() => {
    const status = (e) => timings.get(e.id)?.status
    return {
      all: sorted,
      tonight: sorted.filter((e) => ['live', 'soon', 'today'].includes(status(e))),
      weekend: sorted.filter((e) => {
        const t = timings.get(e.id)
        if (!t?.start || t.status === 'past') return false
        if (t.startsInMin != null && t.startsInMin > 60 * 24 * 8) return false
        return WEEKEND_DAYS.has(jamaicaClock(t.start).day)
      }),
      recurring: sorted.filter((e) => e.recurring),
      past: sorted.filter((e) => status(e) === 'past'),
    }
  }, [sorted, timings])

  const chips = FILTERS.filter((f) => f.key === 'all' || buckets[f.key].length > 0)
  // Derived so a filter can't stay selected after its bucket empties out.
  const activeFilter = chips.some((c) => c.key === filter) ? filter : 'all'
  const visible = buckets[activeFilter]

  const liveCount = buckets.tonight.filter(
    (e) => timings.get(e.id)?.status === 'live',
  ).length

  return (
    <div className={ui.stackLg}>
      <header>
        <p className={ui.eyebrow}>Next 6 months on the island</p>
        <h1 className={ui.display}>Events</h1>
        <p className={cn(ui.lede, 'mt-2')}>
          Festivals, beach parties, and recurring nights across Jamaica — past events stay listed
          too.
        </p>
        {liveCount > 0 && (
          <p className="mt-3 inline-flex items-center gap-2 text-[0.88rem] font-semibold text-danger">
            <span className={ui.pulseLive} aria-hidden />
            {liveCount} happening right now
          </p>
        )}
      </header>

      {!loading && !error && events.length > 0 && (
        <div className={ui.chips} role="group" aria-label="Filter events">
          {chips.map((f) => (
            <button
              key={f.key}
              type="button"
              className={cn(ui.chip, activeFilter === f.key && ui.chipActive)}
              onClick={() => setFilter(f.key)}
              aria-pressed={activeFilter === f.key}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className={ui.pulseTabCount}>{buckets[f.key].length}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className={ui.eventGrid} aria-busy="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton aspect-9/16 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={CalendarDays}
          tone="warn"
          title="Events unavailable"
          description={error}
          action={
            <button type="button" className={btn(ui.btnPrimary)} onClick={refresh}>
              Retry
            </button>
          }
        />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          eyebrow="Quiet week"
          title="No events published yet"
          description="Live music, trivia nights, and premieres will land here once they're added."
          action={
            isAdmin ? (
              <Link to="/admin/events" className={btn(ui.btnPrimary)}>
                Publish an event
              </Link>
            ) : null
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          eyebrow="Quiet stretch"
          title="Nothing in this window"
          description="No events match that filter right now. Try another slice of the calendar."
          action={
            <button type="button" className={btn(ui.btnOutline)} onClick={() => setFilter('all')}>
              Show all events
            </button>
          }
        />
      ) : (
        <div className={ui.eventGrid}>
          {visible.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  )
}

export function EventDetail() {
  const { id } = useParams()
  const { getEvent, getPlace, loading } = useData()
  const { partySize } = useApp()
  const { user } = useAuth()
  const event = getEvent(id)
  const place = event ? getPlace(event.placeId) : null
  const cost = useMemo(() => estimateEvent(event || {}), [event])
  // Called before the early returns below, so hook order stays stable.
  const rsvp = useEventRsvp(event?.id)

  if (loading) return <p className={ui.muted}>Loading…</p>

  if (!event) {
    return (
      <EmptyState
        icon={SearchX}
        eyebrow="404"
        title="Event not found"
        description="This night out may have been removed or the link is off."
        action={
          <Link to="/events" className={btn(ui.btnPrimary)}>
            Browse events
          </Link>
        }
      />
    )
  }

  const status = eventStatus(event)
  const statusLabel = eventStatusLabel(status)
  const past = status === 'past'

  return (
    <div className={ui.stackLg}>
      <div>
        <Link to="/events" className={ui.backLink}>
          <ArrowLeft size={15} />
          All events
        </Link>

        <header className="mt-4">
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                ui.eventBadge,
                'text-white',
                past && ui.eventBadgePast,
                status === 'live' && ui.eventBadgeLive,
                status === 'upcoming' && ui.eventBadgeUpcoming,
              )}
            >
              {statusLabel}
            </span>
            {event.recurring && (
              <span className={cn(ui.eventBadge, ui.eventBadgeRecurring)}>Recurring</span>
            )}
            <span className={ui.pillMuted}>{event.type}</span>
          </div>
          <h1 className={ui.display}>{event.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.9rem] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} /> {event.date} · {event.time}
            </span>
            <span aria-hidden className="text-border-strong">
              ·
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} /> {event.venueName}, {event.area}
            </span>
          </p>
        </header>
      </div>

      <div className={ui.heroFrame}>
        <img
          src={event.image}
          alt=""
          className={cn(ui.heroMedia, 'lg:aspect-21/9', past && 'grayscale')}
        />
      </div>

      <div className={ui.detailGrid}>
        <aside className={cn(ui.detailAside, 'lg:col-start-2 lg:row-start-1')}>
          <div className={cn(ui.cardPanel, 'flex flex-col gap-3')}>
            <div className="flex items-baseline justify-between gap-3">
              <span className={ui.small}>Entry</span>
              <strong className="font-display text-[1.25rem] font-extrabold">{event.price}</strong>
            </div>

            {cost.known && !cost.free && partySize > 1 && (
              <p className={cn(ui.small, 'flex items-center gap-1.5')}>
                <Wallet size={13} />
                About {formatJmd(cost.high * partySize)} for {partySize} people
                {cost.converted && ' (converted)'}
                <span className={ui.costTag}>Est.</span>
              </p>
            )}
            {cost.free && cost.conditional && (
              <p className={cn(ui.small, 'flex items-center gap-1.5')}>
                <Wallet size={13} />
                Free entry only within the window above — expect a cover after that
              </p>
            )}

            <div className={ui.divider} />

            {!past &&
              (user ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={cn(
                      btn(rsvp.mine === 'going' ? ui.btnPrimary : ui.btnOutline),
                      ui.btnSm,
                    )}
                    onClick={() => rsvp.toggle('going')}
                    disabled={rsvp.busy}
                    aria-pressed={rsvp.mine === 'going'}
                  >
                    <Check size={15} />
                    {rsvp.mine === 'going' ? 'Going' : 'I’m going'}
                  </button>
                  <button
                    type="button"
                    className={cn(
                      btn(rsvp.mine === 'interested' ? ui.btnPrimary : ui.btnOutline),
                      ui.btnSm,
                    )}
                    onClick={() => rsvp.toggle('interested')}
                    disabled={rsvp.busy}
                    aria-pressed={rsvp.mine === 'interested'}
                  >
                    <Bookmark size={15} />
                    Interested
                  </button>
                </div>
              ) : (
                <Link
                  to={`/auth?next=/events/${event.id}`}
                  className={cn(btn(ui.btnOutline), ui.btnBlock)}
                >
                  <Check size={15} />
                  Sign in to RSVP
                </Link>
              ))}

            {past ? (
              <button type="button" className={cn(btn(ui.btnPrimary), ui.btnBlock)} disabled>
                Event ended
              </button>
            ) : place ? (
              <Link
                to={`/place/${place.id}`}
                className={cn(btn(ui.btnPrimary), ui.btnBlock)}
              >
                <Ticket size={16} />
                View venue
              </Link>
            ) : null}

            <button
              type="button"
              className={cn(btn(ui.btnOutline), ui.btnBlock)}
              onClick={() => shareReel(event.title, `/events/${event.id}`)}
            >
              <Share2 size={15} />
              Share event
            </button>

            {rsvp.error && <p className={ui.formError}>{rsvp.error}</p>}

            {(rsvp.going > 0 || rsvp.interested > 0) && (
              <p className={cn(ui.small, 'inline-flex items-center gap-1.5')}>
                <Users size={14} />
                {[
                  rsvp.going > 0 && `${rsvp.going.toLocaleString()} going`,
                  rsvp.interested > 0 && `${rsvp.interested.toLocaleString()} interested`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          </div>

          <div className={cn(ui.cardPanel, 'grid gap-2.5')}>
            <p className={ui.infoRow}>
              <CalendarDays size={16} className="mt-0.5 shrink-0 text-primary" />
              {event.date} · {event.time}
            </p>
            <p className={ui.infoRow}>
              <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
              {event.venueName}, {event.area}
            </p>
            {event.recurring && event.recurrenceNote && (
              <p className={cn(ui.infoRow, 'font-semibold text-primary')}>
                <RefreshCw size={16} className="mt-0.5 shrink-0" />
                {event.recurrenceNote}
              </p>
            )}
          </div>
        </aside>

        <div className={cn(ui.stack, 'min-w-0 lg:col-start-1 lg:row-start-1')}>
          <div>
            <h2 className={cn(ui.h3, 'mb-2')}>About this event</h2>
            <p className={cn(ui.lede, 'max-w-none')}>{event.description}</p>
          </div>

          {past && (
            <p className={ui.note}>
              This event has ended
              {event.recurring
                ? ' — it typically comes back on the next cycle.'
                : '. Browse upcoming events to find something similar.'}
            </p>
          )}

          {!past && event.placeId == null && (
            <p className={ui.note}>Check the venue for tickets and exact times.</p>
          )}

          {place && (
            <div>
              <h2 className={cn(ui.h3, 'mb-2.5')}>Venue</h2>
              <Link
                to={`/place/${place.id}`}
                className={cn(ui.cardFlat, ui.cardHover, 'flex items-center gap-3.5 p-3')}
              >
                <img
                  src={place.image}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
                <span className="min-w-0 flex-1">
                  <strong className="block truncate">{place.name}</strong>
                  <span className="mt-0.5 inline-flex items-center gap-1.5 text-[0.82rem] text-muted">
                    <MapPin size={13} />
                    {[place.neighborhood, place.area].filter(Boolean).join(', ')}
                  </span>
                </span>
                <span className={cn(ui.textLink, 'shrink-0')}>Open</span>
              </Link>
            </div>
          )}

          <EventChat
            eventId={event.id}
            joined={rsvp.joined}
            onJoin={() => rsvp.toggle('going')}
            joining={rsvp.busy}
          />
        </div>
      </div>
    </div>
  )
}

export default Events
