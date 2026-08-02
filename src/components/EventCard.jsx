import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, RefreshCw } from 'lucide-react'
import { cn, ui } from '../lib/ui'
import { eventStatus, eventStatusLabel } from '../lib/events'

export default function EventCard({ event, compact = false }) {
  const status = eventStatus(event)
  const statusLabel = eventStatusLabel(status)

  return (
    <Link
      to={`/events/${event.id}`}
      className={cn(
        ui.eventCard,
        compact && ui.eventCardCompact,
        status === 'past' && ui.eventPastCard,
      )}
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
        <h3 className={ui.eventCardBodyTitle}>{event.title}</h3>
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
          <div className={ui.avatarStack}>
            {(event.attendees || []).slice(0, 3).map((a) => (
              <img
                key={a.name}
                src={a.avatar}
                alt=""
                title={a.name}
                className={ui.avatarStackImg}
              />
            ))}
            <span>{event.going} going</span>
          </div>
          <span className={cn(ui.rsvp, status === 'past' && 'text-muted')}>
            <CalendarDays size={13} />
            {status === 'past' ? 'Ended' : 'RSVP'}
          </span>
        </div>
      </div>
    </Link>
  )
}
