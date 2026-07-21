import { Link } from 'react-router-dom'
import { CalendarDays, MapPin } from 'lucide-react'

export default function EventCard({ event, compact = false }) {
  return (
    <Link
      to={`/events/${event.id}`}
      className={`event-card${compact ? ' is-compact' : ''}`}
    >
      <div className="event-card-media">
        <img src={event.image} alt={event.title} loading="lazy" />
        <span className="event-type">{event.type}</span>
        <span className="event-when">
          {event.date} · {event.time}
        </span>
      </div>
      <div className="event-card-body">
        <h3>{event.title}</h3>
        <p>
          <MapPin size={13} />
          {event.venueName} · {event.area}
        </p>
        <div className="event-card-foot">
          <div className="avatar-stack">
            {event.attendees.slice(0, 3).map((a) => (
              <img key={a.name} src={a.avatar} alt="" title={a.name} />
            ))}
            <span>{event.going} going</span>
          </div>
          <span className="rsvp">
            <CalendarDays size={13} />
            RSVP
          </span>
        </div>
      </div>
    </Link>
  )
}
