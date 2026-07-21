import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { List, Map as MapIcon, Star, Camera } from 'lucide-react'
import {
  places,
  events,
  priceLabel,
  CURRENT_USER,
  getPlace,
} from '../data/outyahData'
import SearchBar from '../components/SearchBar'
import CategoryChips from '../components/CategoryChips'
import EventCard from '../components/EventCard'
import InstagramPostCard from '../components/InstagramPostCard'
import { PlacesMap } from '../components/maps/GoogleMaps'
import { useInstagramFeed } from '../hooks/useInstagramFeed'
import { useApp } from '../context/AppContext'

export default function HomeFeed() {
  const [view, setView] = useState('feed')
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(places[0]?.id)
  const { posts, source, error, loading } = useInstagramFeed()
  const { isFavorite, toggleFavorite } = useApp()

  const filteredPosts = useMemo(() => {
    let list = posts
    if (cat !== 'all') {
      list = list.filter((post) => getPlace(post.placeId)?.category === cat)
    }
    if (q.trim()) {
      const s = q.toLowerCase()
      list = list.filter((post) => {
        const place = getPlace(post.placeId)
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
  }, [posts, cat, q])

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
  }, [filteredPosts, cat, q])

  const active = places.find((p) => p.id === selected) || mapPlaces[0]

  return (
    <div className="stack-lg">
      <header className="feed-header">
        <div className="feed-header-row">
          <div>
            <p className="eyebrow">Wah gwaan, {CURRENT_USER.name.split(' ')[0]}</p>
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

      {view === 'feed' && (
        <section>
          <div className="section-head">
            <h2>Happening this week</h2>
            <Link to="/events" className="text-link">
              See all
            </Link>
          </div>
          <div className="event-strip">
            {events.map((e) => (
              <EventCard key={e.id} event={e} compact />
            ))}
          </div>
        </section>
      )}

      <div className="chips-sticky">
        <CategoryChips selected={cat} onSelect={setCat} />
      </div>

      {view === 'feed' ? (
        <section className="stack">
          <div className="section-head">
            <h2 className="ig-section-title">
              <Camera size={18} />
              {source === 'instagram' ? 'From Instagram' : 'Instagram-style feed'}
            </h2>
            <span className="muted-count">
              {loading ? 'Loading…' : `${filteredPosts.length} posts`}
            </span>
          </div>

          {source === 'demo' && (
            <p className="ig-source-note">
              Showing curated Instagram-style posts (photos + comments). Add{' '}
              <code>VITE_INSTAGRAM_ACCESS_TOKEN</code> and{' '}
              <code>VITE_INSTAGRAM_USER_ID</code> in <code>.env</code> to pull live media.
            </p>
          )}
          {error && (
            <p className="ig-source-note ig-source-error">
              Live Instagram fetch failed — using curated posts. ({error})
            </p>
          )}

          {loading ? (
            <p className="muted">Loading Instagram feed…</p>
          ) : (
            <div className="ig-feed">
              {filteredPosts.map((post) => (
                <InstagramPostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {!loading && filteredPosts.length === 0 && (
            <p className="empty">No posts match that search. Try another vibe.</p>
          )}
        </section>
      ) : (
        <section className="stack">
          <div className="map-panel">
            <div className="map-canvas">
              <PlacesMap
                places={mapPlaces}
                selectedId={selected}
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
                className={`map-rail-card${selected === p.id ? ' is-active' : ''}`}
                onClick={() => setSelected(p.id)}
              >
                <img src={p.image} alt="" />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
