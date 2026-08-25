import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Compass, GalleryVerticalEnd, MapPin } from 'lucide-react'
import { AREAS } from '../data/outyahData'
import CategoryChips from '../components/CategoryChips'
import EmptyState from '../components/EmptyState'
import PlaceCard from '../components/PlaceCard'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { cn, ui, btn } from '../lib/ui'

function buildFeedItems(posts, places, { area, cat }) {
  const placeById = new Map(places.map((p) => [p.id, p]))
  const items = []
  const seen = new Set()

  const matches = (place) => {
    if (!place) return false
    if (area !== 'all' && place.area !== area) return false
    if (cat !== 'all' && place.category !== cat) return false
    return true
  }

  for (const post of posts) {
    const place = placeById.get(post.placeId)
    if (!place || !post.mediaUrl || !matches(place)) continue
    items.push({
      id: `post-${post.id}`,
      place,
      image: post.mediaUrl,
    })
    seen.add(place.id)
  }

  const rest = places
    .filter((p) => p.image && !seen.has(p.id) && matches(p))
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
  const [area, setArea] = useState('all')
  const [cat, setCat] = useState('all')
  const { places, posts, loading, error, refresh } = useData()
  const { isAdmin } = useAuth()

  const parishOptions = useMemo(() => {
    const present = new Set(places.map((p) => p.area).filter(Boolean))
    return AREAS.filter((a) => present.has(a))
  }, [places])

  const items = useMemo(
    () => buildFeedItems(posts, places, { area, cat }),
    [posts, places, area, cat],
  )

  return (
    <div className={ui.feedShell}>
      <header className={ui.feedHead}>
        <div className="mb-2.5 flex items-start justify-between gap-3">
          <div>
            <p className={ui.kicker}>Signature differentiator</p>
            <h1 className="font-display text-[1.35rem] font-extrabold tracking-tight">
              Full-screen feed
            </h1>
            <p className="mt-1 max-w-md text-[0.82rem] leading-snug text-muted">
              One venue per post — swipe through curated spots tagged by parish and category.
            </p>
          </div>
          <GalleryVerticalEnd size={22} className="mt-1 shrink-0 text-primary" aria-hidden />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[0.78rem] font-semibold text-muted">
            <MapPin size={13} className="text-primary" />
            <select
              className="max-w-[9rem] cursor-pointer border-none bg-transparent text-[0.78rem] font-semibold text-fg outline-none"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              aria-label="Filter feed by parish"
            >
              <option value="all">All parishes</option>
              {parishOptions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-2.5 -mx-1 overflow-x-auto pb-0.5 rail-scroll">
          <CategoryChips selected={cat} onSelect={setCat} />
        </div>
      </header>

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
