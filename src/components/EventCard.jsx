import { Link } from 'react-router-dom'
import { CalendarDays, MapPin } from 'lucide-react'
import { cn, ui } from '../lib/ui'

export default function EventCard({ event, compact = false }) {
  return (
    <Link
      to={`/events/${event.id}`}
      className={cn(ui.eventCard, compact && ui.eventCardCompact)}
    >
      <div className={ui.eventCardMedia}>
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <span className={ui.eventType}>{event.type}</span>
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
        <div className={ui.eventCardFoot}>
          <div className={ui.avatarStack}>
            {event.attendees.slice(0, 3).map((a) => (
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
          <span className={ui.rsvp}>
            <CalendarDays size={13} />
            RSVP
          </span>
        </div>
      </div>
    </Link>
  )
}
