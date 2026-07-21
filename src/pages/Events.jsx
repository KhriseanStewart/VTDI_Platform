import { Link, useParams } from 'react-router-dom'
import { CalendarDays, MapPin, Ticket } from 'lucide-react'
import { events, getEvent, getPlace } from '../data/outyahData'
import EventCard from '../components/EventCard'

export function Events() {
  return (
    <div className="stack-lg">
      <header>
        <p className="eyebrow">This week on the island</p>
        <h1 className="display">Events</h1>
      </header>
      <div className="event-grid">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </div>
  )
}

export function EventDetail() {
  const { id } = useParams()
  const event = getEvent(id)
  const place = event ? getPlace(event.placeId) : null

  if (!event) {
    return (
      <section className="stack">
        <h1 className="display">Event not found</h1>
        <Link to="/events" className="btn btn-primary">
          All events
        </Link>
      </section>
    )
  }

  return (
    <div className="stack-lg">
      <Link to="/events" className="text-link">
        ← All events
      </Link>
      <div className="event-hero">
        <img src={event.image} alt={event.title} />
        <span className="event-type">{event.type}</span>
      </div>
      <header>
        <h1 className="display">{event.title}</h1>
        <p className="place-detail-meta">
          <span>
            <CalendarDays size={14} /> {event.date} · {event.time}
          </span>
          <span>·</span>
          <span>
            <MapPin size={14} /> {event.venueName}, {event.area}
          </span>
          <span>·</span>
          <span>
            <Ticket size={14} /> {event.price}
          </span>
        </p>
      </header>
      <p className="lede">{event.description}</p>
      <div className="avatar-stack large">
        {event.attendees.map((a) => (
          <img key={a.name} src={a.avatar} alt={a.name} title={a.name} />
        ))}
        <span>
          {event.going} going · {event.interested} interested
        </span>
      </div>
      <div className="action-row">
        <button type="button" className="btn btn-primary">
          RSVP going
        </button>
        {place && (
          <Link to={`/place/${place.id}`} className="btn btn-outline">
            View venue
          </Link>
        )}
      </div>
    </div>
  )
}

export default Events
