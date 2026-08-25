import { useNavigate } from 'react-router-dom'
import { Bookmark, Heart, Share2 } from 'lucide-react'
import { eventStatus, eventStatusLabel } from '../lib/events'
import { cn, ui } from '../lib/ui'
import MediaReel from './MediaReel'
import { reelHandle, reelHashtags, shareReel } from '../lib/reelMeta'

function formatCount(n) {
  if (!n) return ''
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`
  return String(n)
}

export default function EventCard({ event, compact = false }) {
  const navigate = useNavigate()
  const status = eventStatus(event)
  const statusLabel = eventStatusLabel(status)
  const path = `/events/${event.id}`
  const caption = [event.venueName, event.area].filter(Boolean).join(' · ')

  return (
    <MediaReel
      to={path}
      image={event.image}
      alt={event.title}
      handle={reelHandle(event.title)}
      title={event.title}
      caption={caption}
      hashtags={reelHashtags([event.area, event.type, event.venueName, 'jamaica', 'events'])}
      dimmed={status === 'past'}
      compact={compact}
      badge={
        <span
          className={cn(
            ui.eventBadge,
            'text-white',
            status === 'past' && ui.eventBadgePast,
            status === 'live' && ui.eventBadgeLive,
            status === 'upcoming' && ui.eventBadgeUpcoming,
          )}
        >
          {statusLabel}
        </span>
      }
      when={`${event.date} · ${event.time}`}
      actions={[
        {
          key: 'like',
          label: 'Event details',
          count: formatCount(event.going),
          icon: <Heart size={22} />,
          onClick: () => navigate(path),
        },
        {
          key: 'save',
          label: 'Save event',
          count: formatCount(event.interested),
          icon: <Bookmark size={22} />,
          onClick: () => navigate(path),
        },
        {
          key: 'share',
          label: 'Share event',
          icon: <Share2 size={20} />,
          onClick: () => shareReel(event.title, path),
        },
      ]}
    />
  )
}
