import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarDays, MapPin, Ticket, SearchX, RefreshCw } from 'lucide-react'
import EventCard from '../components/EventCard'
import EmptyState from '../components/EmptyState'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { eventStatus, eventStatusLabel, sortEvents } from '../lib/events'
import { btn, cn, ui } from '../lib/ui'

export function Events() {
  const { events, loading, error, refresh } = useData()
  const { isAdmin } = useAuth()
  const sorted = useMemo(() => sortEvents(events), [events])

  return (
    <div className={ui.stackLg}>
      <header>
        <p className={ui.eyebrow}>This week on the island</p>
        <h1 className={ui.display}>Events</h1>
        <p className={cn(ui.muted, 'mt-1 text-sm')}>
          Past nights stay listed so you can see what you missed — recurring events are marked.
        </p>
      </header>
      {loading ? (
        <p className={ui.muted}>Loading events…</p>
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
      ) : (
        <div className={ui.eventGrid}>
          {sorted.map((e) => (
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
  const event = getEvent(id)
  const place = event ? getPlace(event.placeId) : null

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

  return (
    <div className={ui.stackLg}>
      <Link to="/events" className={ui.textLink}>
        ← All events
      </Link>
      <div className={ui.eventHero}>
        <img
          src={event.image}
          alt={event.title}
          className={cn('h-full w-full object-cover', status === 'past' && 'grayscale')}
        />
        <div className={ui.eventBadgeRow}>
          <span
            className={cn(
              ui.eventBadge,
              status === 'past' && ui.eventBadgePast,
              status === 'live' && ui.eventBadgeLive,
              status === 'upcoming' && ui.eventBadgeUpcoming,
            )}
          >
            {statusLabel}
          </span>
          {event.recurring && (
            <span className={cn(ui.eventBadge, ui.eventBadgeRecurring)}>Recurring</span>
          )}
          <span className={cn(ui.eventBadge, 'bg-card/95 text-fg')}>{event.type}</span>
        </div>
      </div>
      <header>
        <h1 className={ui.display}>{event.title}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-[0.45rem] text-[0.9rem] text-muted">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={14} /> {event.date} · {event.time}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} /> {event.venueName}, {event.area}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Ticket size={14} /> {event.price}
          </span>
        </p>
        {event.recurring && event.recurrenceNote && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            <RefreshCw size={14} />
            {event.recurrenceNote}
          </p>
        )}
        {status === 'past' && (
          <p className="mt-2 text-sm font-semibold text-muted">
            This event has ended
            {event.recurring ? ' — it typically comes back on the next cycle.' : '.'}
          </p>
        )}
      </header>
      <p className={ui.lede}>{event.description}</p>
      <div className={ui.avatarStack}>
        {(event.attendees || []).map((a) => (
          <img
            key={a.name}
            src={a.avatar}
            alt={a.name}
            title={a.name}
            className={ui.avatarStackImgLarge}
          />
        ))}
        <span>
          {event.going} going · {event.interested} interested
        </span>
      </div>
      <div className={ui.actionRow}>
        <button
          type="button"
          className={btn(ui.btnPrimary)}
          disabled={status === 'past'}
        >
          {status === 'past' ? 'Event ended' : 'RSVP going'}
        </button>
        {place && (
          <Link to={`/place/${place.id}`} className={btn(ui.btnOutline)}>
            View venue
          </Link>
        )}
      </div>
    </div>
  )
}

export default Events
