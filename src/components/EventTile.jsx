import { Link } from 'react-router-dom'
import { Radio, Ticket, Timer, Users } from 'lucide-react'
import { formatRelative } from '../lib/pulse'
import { cn, ui } from '../lib/ui'

/**
 * Compact browse card for an event. Leads with time-to-start rather than a
 * static date, so a row of these reads as a schedule instead of a catalog.
 */
export default function EventTile({ event, timing, wide = false }) {
  let badge = null
  if (timing?.status === 'live') {
    badge = { text: 'On now', tone: ui.tileBadgeLive, icon: <Radio size={10} /> }
  } else if (timing?.status === 'soon') {
    badge = {
      text: `In ${formatRelative(timing.startsInMin)}`,
      tone: ui.tileBadgeSoon,
      icon: <Timer size={10} />,
    }
  } else if (timing?.status === 'past') {
    badge = { text: 'Ended', tone: null }
  } else if (event.recurring) {
    badge = { text: 'Recurring', tone: null }
  }

  const going = Number(event.going) || 0

  return (
    <article className={cn(ui.tile, wide && ui.tileWide)}>
      <Link to={`/events/${event.id}`} className={ui.tileMedia}>
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className={cn(ui.tileImg, timing?.status === 'past' && 'grayscale')}
        />
        {badge && (
          <span className={cn(ui.tileBadge, badge.tone)}>
            {badge.icon}
            {badge.text}
          </span>
        )}
      </Link>

      <Link to={`/events/${event.id}`} className={ui.tileBody}>
        <span className={ui.tileTitle}>{event.title}</span>
        <span className={ui.tileMeta}>
          {[event.venueName, event.area].filter(Boolean).join(' · ')}
        </span>
        <span className={ui.tileFoot}>
          <span className="min-w-0 truncate font-semibold text-fg">
            {timing?.status === 'live' ? 'Happening now' : event.date}
          </span>
          {event.price && (
            <span className="inline-flex shrink-0 items-center gap-1">
              <Ticket size={12} />
              {event.price}
            </span>
          )}
          {!event.price && going > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1">
              <Users size={12} />
              {going.toLocaleString()}
            </span>
          )}
        </span>
      </Link>
    </article>
  )
}
