import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Compass } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PlaceCard from '../components/PlaceCard'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { cn, ui, btn } from '../lib/ui'

function buildFeedItems(posts, places) {
  const placeById = new Map(places.map((p) => [p.id, p]))
  const items = []
  const seen = new Set()

  for (const post of posts) {
    const place = placeById.get(post.placeId)
    if (!place || !post.mediaUrl) continue
    items.push({
      id: `post-${post.id}`,
      place,
      image: post.mediaUrl,
    })
    seen.add(place.id)
  }

  const rest = places
    .filter((p) => p.image && !seen.has(p.id))
    .sort(
      (a, b) =>
        Number(b.rating || 0) - Number(a.rating || 0) ||
        (b.reviewCount || 0) - (a.reviewCount || 0),
    )

  for (const place of rest) {
    items.push({ id: `place-${place.id}`, place, image: place.image })
  }

  return items
}

export default function Feed() {
  const { places, posts, loading, error, refresh } = useData()
  const { isAdmin } = useAuth()

  const items = useMemo(() => buildFeedItems(posts, places), [posts, places])

  return (
    <div className={ui.feedShell}>
      {error && (
        <div className="px-4 py-6 sm:px-6">
          <EmptyState
            icon={AlertTriangle}
            tone="warn"
            eyebrow="Connection"
            title="Couldn't reach Supabase"
            description={error}
            action={
              <button type="button" className={btn(ui.btnPrimary)} onClick={refresh}>
                Try again
              </button>
            }
          />
        </div>
      )}

      {!error && loading && (
        <div className={cn(ui.feedSlide, 'animate-pulse bg-border/40')} aria-busy="true" />
      )}

      {!error && !loading && items.length === 0 && (
        <div className="px-4 py-10 sm:px-6">
          <EmptyState
            icon={Compass}
            eyebrow="Feed"
            title="Nothing in the feed yet"
            description="Approved venue photos and listings show up here — image-first, one swipe at a time."
            action={
              isAdmin ? (
                <Link to="/admin/places" className={btn(ui.btnPrimary)}>
                  Add a place
                </Link>
              ) : (
                <Link to="/explore" className={btn(ui.btnOutline)}>
                  Browse Explore
                </Link>
              )
            }
          />
        </div>
      )}

      {!error && !loading && items.length > 0 && (
        <div className={ui.feedScroller} aria-label="Venue feed">
          {items.map(({ id, place, image }) => (
            <div key={id} className={ui.feedSlide}>
              <PlaceCard place={place} image={image} fullScreen />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
