import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  List,
  Map as MapIcon,
  Star,
  Camera,
  CalendarDays,
  Compass,
  AlertTriangle,
} from 'lucide-react'
import { CATEGORY_LABELS, priceLabel } from '../data/outyahData'
import SearchBar from '../components/SearchBar'
import CategoryChips from '../components/CategoryChips'
import EventCard from '../components/EventCard'
import InstagramPostCard from '../components/InstagramPostCard'
import EmptyState from '../components/EmptyState'
import { PlacesMap } from '../components/maps/GoogleMaps'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

export default function HomeFeed() {
  const [view, setView] = useState('feed')
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const { places, events, posts, loading, error, refresh } = useData()
  const [selected, setSelected] = useState(null)
  const { isFavorite, toggleFavorite } = useApp()
  const { profile, user, isAdmin } = useAuth()

  const greetingName =
    profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'friend'

  const filteredPosts = useMemo(() => {
    let list = posts
    if (cat !== 'all') {
      list = list.filter((post) => {
        const place = places.find((p) => p.id === post.placeId)
        return place?.category === cat
      })
    }
    if (q.trim()) {
      const s = q.toLowerCase()
      list = list.filter((post) => {
        const place = places.find((p) => p.id === post.placeId)
        return (
          post.caption?.toLowerCase().includes(s) ||
          post.username?.toLowerCase().includes(s) ||
          place?.name.toLowerCase().includes(s) ||
          place?.area.toLowerCase().includes(s) ||
          place?.neighborhood.toLowerCase().includes(s)
        )
      })
    }
    return list
  }, [posts, places, cat, q])

  const mapPlaces = useMemo(() => {
    const ids = new Set(filteredPosts.map((p) => p.placeId).filter(Boolean))
    let list = places.filter((p) => ids.has(p.id))
    if (!list.length) {
      list = cat === 'all' ? places : places.filter((p) => p.category === cat)
    }
    if (q.trim()) {
      const s = q.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.area.toLowerCase().includes(s) ||
          p.neighborhood.toLowerCase().includes(s),
      )
    }
    return list
  }, [filteredPosts, places, cat, q])

  const activeId = selected || mapPlaces[0]?.id
  const active = places.find((p) => p.id === activeId) || mapPlaces[0]
  const heading = cat === 'all' ? 'Around Jamaica' : CATEGORY_LABELS[cat]

  return (
    <div className="stack-lg">
      <header className="feed-header">
        <div className="feed-header-row">
          <div>
            <p className="eyebrow">Wah gwaan, {greetingName}</p>
            <h1 className="display">Find your next outing</h1>
          </div>
          <div className="view-toggle" role="group" aria-label="Feed or map view">
            <button
              type="button"
              className={`view-toggle-btn${view === 'feed' ? ' is-active' : ''}`}
              onClick={() => setView('feed')}
            >
              <List size={15} /> Feed
            </button>
            <button
              type="button"
              className={`view-toggle-btn${view === 'map' ? ' is-active' : ''}`}
              onClick={() => setView('map')}
            >
              <MapIcon size={15} /> Map
            </button>
          </div>
        </div>
        <SearchBar value={q} onChange={setQ} />
      </header>

      {error && (
        <EmptyState
          icon={AlertTriangle}
          tone="warn"
          eyebrow="Connection"
          title="Couldn't reach Supabase"
          description={error}
          action={
            <button type="button" className="btn btn-primary" onClick={refresh}>
              Try again
            </button>
          }
        />
      )}

      {!error && view === 'feed' && (
        <section>
          <div className="section-head">
            <h2>Happening this week</h2>
            <Link to="/events" className="text-link">
              See all
            </Link>
          </div>
          {loading ? (
            <p className="muted">Loading events…</p>
          ) : events.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              eyebrow="Events"
              title="No events on the calendar"
              description="When admins publish nights out, live music, and premieres, they'll show up here."
              action={
                isAdmin ? (
                  <Link to="/admin/events" className="btn btn-primary">
                    Add an event
                  </Link>
                ) : null
              }
            />
          ) : (
            <div className="event-strip">
              {events.map((e) => (
                <EventCard key={e.id} event={e} compact />
              ))}
            </div>
          )}
        </section>
      )}

      {!error && (
        <div className="chips-sticky">
          <CategoryChips selected={cat} onSelect={setCat} />
        </div>
      )}

      {!error && view === 'feed' ? (
        <section className="stack">
          <div className="section-head">
            <h2 className="ig-section-title">
              <Camera size={18} />
              {heading}
            </h2>
            <span className="muted-count">
              {loading ? 'Loading…' : `${filteredPosts.length} posts`}
            </span>
          </div>

          {loading ? (
            <p className="muted">Loading feed…</p>
          ) : filteredPosts.length === 0 ? (
            <EmptyState
              icon={Camera}
              eyebrow="Feed"
              title={posts.length === 0 ? 'The feed is waiting' : 'No matches'}
              description={
                posts.length === 0
                  ? 'Be the first vibe on the island — publish a photo post from the admin portal.'
                  : 'Nothing matches that search or category. Clear filters and try again.'
              }
              action={
                posts.length === 0 && isAdmin ? (
                  <Link to="/admin/posts" className="btn btn-primary">
                    Create a post
                  </Link>
                ) : posts.length > 0 ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setCat('all')
                      setQ('')
                    }}
                  >
                    Clear filters
                  </button>
                ) : null
              }
            />
          ) : (
            <div className="ig-feed">
              {filteredPosts.map((post) => (
                <InstagramPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      ) : !error ? (
        <section className="stack">
          {loading ? (
            <p className="muted">Loading map…</p>
          ) : mapPlaces.length === 0 ? (
            <EmptyState
              icon={Compass}
              eyebrow="Map"
              title="No places to pin"
              description="Add venues in admin and they'll light up across Jamaica."
              action={
                isAdmin ? (
                  <Link to="/admin/places" className="btn btn-primary">
                    Add a place
                  </Link>
                ) : null
              }
            />
          ) : (
            <>
              <div className="map-panel">
                <div className="map-canvas">
                  <PlacesMap
                    places={mapPlaces}
                    selectedId={activeId}
                    onSelect={setSelected}
                  />
                </div>

                {active && (
                  <div className="map-selected">
                    <Link to={`/place/${active.id}`} className="map-selected-card">
                      <img src={active.image} alt="" />
                      <div>
                        <strong>{active.name}</strong>
                        <span>
                          <Star size={12} fill="currentColor" /> {active.rating} ·{' '}
                          {priceLabel(active.priceRange)} · {active.area}
                        </span>
                      </div>
                    </Link>
                    <button
                      type="button"
                      className={`btn btn-sm${isFavorite(active.id) ? ' btn-primary' : ' btn-outline'}`}
                      onClick={() => toggleFavorite(active.id)}
                    >
                      {isFavorite(active.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <div className="map-rail">
                {mapPlaces.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`map-rail-card${activeId === p.id ? ' is-active' : ''}`}
                    onClick={() => setSelected(p.id)}
                  >
                    <img src={p.image} alt="" />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      ) : null}
    </div>
  )
}
