import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, RefreshCw } from 'lucide-react'
import { cn, ui } from '../lib/ui'
import { eventStatus, eventStatusLabel } from '../lib/events'

export default function EventCard({ event, compact = false }) {
  const status = eventStatus(event)
  const statusLabel = eventStatusLabel(status)

  if (compact) {
    return (
      <Link
        to={`/events/${event.id}`}
        className={cn(
          ui.eventCard,
          ui.eventCardCompact,
          status === 'past' && ui.eventPastCard,
        )}
      >
        <div className={cn(ui.eventCardMedia, 'rounded-none')}>
          <img
            src={event.image}
            alt={event.title}
            loading="lazy"
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
          </div>
          <span className={ui.eventWhen}>
            {event.date} · {event.time}
          </span>
        </div>
        <div className={ui.eventCardBody}>
          <h3 className={ui.eventCardBodyTitle}>{event.title}</h3>
          <p className={ui.eventCardBodyMeta}>
            <MapPin size={13} />
            {event.venueName} · {event.area}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/events/${event.id}`}
      className={cn(ui.eventCard, status === 'past' && ui.eventPastCard)}
    >
      <div className={ui.eventCardMedia}>
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
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
            <span className={cn(ui.eventBadge, ui.eventBadgeRecurring)}>
              Recurring
            </span>
          )}
        </div>
        <span className={ui.eventWhen}>
          {event.date} · {event.time}
        </span>
      </div>
      <div className={ui.eventCardBody}>
        <p className={ui.eventCardType}>{event.type || 'Event'}</p>
        <h3 className={cn(ui.eventCardBodyTitle, 'mt-1 font-display')}>{event.title}</h3>
        <p className={ui.eventCardBodyMeta}>
          <MapPin size={13} />
          {event.venueName} · {event.area}
        </p>
        {event.recurring && event.recurrenceNote && (
          <p className={cn(ui.eventCardBodyMeta, 'text-primary')}>
            <RefreshCw size={12} />
            {event.recurrenceNote}
          </p>
        )}
        <div className={ui.eventCardFoot}>
          {status === 'past' ? (
            <span className={cn(ui.rsvp, 'text-muted')}>
              <CalendarDays size={13} />
              Ended
            </span>
          ) : (
            <span className={ui.rsvp}>
              <CalendarDays size={13} />
              View details
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
