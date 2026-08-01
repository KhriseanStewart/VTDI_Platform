import { Link, useParams } from 'react-router-dom'
import { CalendarDays, MapPin, Ticket, SearchX } from 'lucide-react'
import EventCard from '../components/EventCard'
import EmptyState from '../components/EmptyState'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { btn, ui } from '../lib/ui'

export function Events() {
  const { events, loading, error, refresh } = useData()
  const { isAdmin } = useAuth()

  return (
    <div className={ui.stackLg}>
      <header>
        <p className={ui.eyebrow}>This week on the island</p>
        <h1 className={ui.display}>Events</h1>
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
      ) : events.length === 0 ? (
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

  return (
    <div className={ui.stackLg}>
      <Link to="/events" className={ui.textLink}>
        ← All events
      </Link>
      <div className={ui.eventHero}>
        <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
        <span className={ui.eventType}>{event.type}</span>
      </div>
      <header>
        <h1 className={ui.display}>{event.title}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-[0.45rem] text-[0.9rem] text-muted">
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
        <button type="button" className={btn(ui.btnPrimary)}>
          RSVP going
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
