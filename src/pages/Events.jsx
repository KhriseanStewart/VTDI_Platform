import { Link, useParams } from 'react-router-dom'
import { CalendarDays, MapPin, Ticket, SearchX } from 'lucide-react'
import EventCard from '../components/EventCard'
import EmptyState from '../components/EmptyState'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'

export function Events() {
  const { events, loading, error, refresh } = useData()
  const { isAdmin } = useAuth()

  return (
    <div className="stack-lg">
      <header>
        <p className="eyebrow">This week on the island</p>
        <h1 className="display">Events</h1>
      </header>
      {loading ? (
        <p className="muted">Loading events…</p>
      ) : error ? (
        <EmptyState
          icon={CalendarDays}
          tone="warn"
          title="Events unavailable"
          description={error}
          action={
            <button type="button" className="btn btn-primary" onClick={refresh}>
              Retry
            </button>
          }
        />
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          eyebrow="Quiet week"
          title="No events published yet"
          description="Live music, trivia nights, and premieres will land here once they're added."
          action={
            isAdmin ? (
              <Link to="/admin/events" className="btn btn-primary">
                Publish an event
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="event-grid">
          {events.map((e) => (
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

  if (loading) return <p className="muted">Loading…</p>

  if (!event) {
    return (
      <EmptyState
        icon={SearchX}
        eyebrow="404"
        title="Event not found"
        description="This night out may have been removed or the link is off."
        action={
          <Link to="/events" className="btn btn-primary">
            Browse events
          </Link>
        }
      />
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
        {(event.attendees || []).map((a) => (
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
