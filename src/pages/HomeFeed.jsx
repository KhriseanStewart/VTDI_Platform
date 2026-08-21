import { useEffect, useMemo, useState } from 'react'
import { sortEvents, eventStatus } from '../lib/events'
import { Link, useSearchParams } from 'react-router-dom'
import {
  List,
  Map as MapIcon,
  Star,
  Camera,
  Compass,
  AlertTriangle,
  MapPin,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { AREAS, CATEGORY_LABELS, priceLabel } from '../data/outyahData'
import CategoryChips from '../components/CategoryChips'
import EventCard from '../components/EventCard'
import PlaceCard from '../components/PlaceCard'
import InstagramPostCard from '../components/InstagramPostCard'
import EmptyState from '../components/EmptyState'
import { PlacesMap } from '../components/maps/GoogleMaps'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { cn, ui, btn } from '../lib/ui'

export default function HomeFeed() {
  const [view, setView] = useState('feed')
  const [cat, setCat] = useState('all')
  const [area, setArea] = useState('all')
  const [q, setQ] = useState('')
  const [searchParams] = useSearchParams()
  const { places, events, posts, loading, error, refresh } = useData()
  const [selected, setSelected] = useState(null)
  const { isFavorite, toggleFavorite } = useApp()
  const { profile, user, isAdmin } = useAuth()

  const greetingName =
    profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'friend'

  useEffect(() => {
    const fromUrl = searchParams.get('q')
    if (fromUrl) setQ(fromUrl)
  }, [searchParams])

  const filteredPlaces = useMemo(() => {
    let list = cat === 'all' ? places : places.filter((p) => p.category === cat)
    if (area !== 'all') {
      list = list.filter((p) => p.area === area)
    }
    if (q.trim()) {
      const s = q.toLowerCase()
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(s) ||
          p.area?.toLowerCase().includes(s) ||
          p.neighborhood?.toLowerCase().includes(s) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(s)),
      )
    }
    return list
  }, [places, cat, area, q])

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

  const popularTrips = useMemo(() => {
    return sortEvents(events)
      .filter((e) => eventStatus(e) !== 'past')
      .slice(0, 6)
  }, [events])

  const parishOptions = useMemo(() => {
    const present = new Set(places.map((p) => p.area).filter(Boolean))
    return AREAS.filter((a) => present.has(a))
  }, [places])

  const mapPlaces = filteredPlaces
  const activeId = selected || mapPlaces[0]?.id
  const active = places.find((p) => p.id === activeId) || mapPlaces[0]
  const heading = cat === 'all' ? 'Results' : CATEGORY_LABELS[cat]

  const scrollStrip = (id, dir) => {
    document.getElementById(id)?.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  return (
    <div className={ui.stackLg}>
      <header>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className={ui.eyebrow}>Wah gwaan, {greetingName}</p>
            <h1 className={ui.display}>Find a trip</h1>
            <p className={cn(ui.muted, 'mt-1 max-w-md text-sm')}>
              Search the island by place, parish, or vibe — then open the map when you&apos;re ready
              to move.
            </p>
          </div>
          <div className={ui.viewToggle} role="group" aria-label="Feed or map view">
            <button
              type="button"
              className={cn(ui.viewToggleBtn, view === 'feed' && ui.viewToggleBtnActive)}
              onClick={() => setView('feed')}
            >
              <List size={15} /> Feed
            </button>
            <button
              type="button"
              className={cn(ui.viewToggleBtn, view === 'map' && ui.viewToggleBtnActive)}
              onClick={() => setView('map')}
            >
              <MapIcon size={15} /> Map
            </button>
          </div>
        </div>

        <div className={ui.discoverPanel}>
          <div className={ui.discoverRow}>
            <label className={ui.discoverField}>
              <span className={ui.discoverFieldLabel}>Where to go</span>
              <span className="flex items-center gap-2">
                <MapPin size={16} className="shrink-0 text-primary" />
                <select
                  className={ui.discoverFieldControl}
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  aria-label="Parish"
                >
                  <option value="all">All of Jamaica</option>
                  {parishOptions.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <label className={ui.discoverField}>
              <span className={ui.discoverFieldLabel}>Looking for</span>
              <input
                className={ui.discoverFieldControl}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Beach, jerk, waterfall…"
                aria-label="Search places"
              />
            </label>

            <button
              type="button"
              className={ui.discoverSearchBtn}
              onClick={() => setView('feed')}
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </div>
      </header>

      {error && (
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
      )}

      {!error && view === 'feed' && popularTrips.length > 0 && (
        <section>
          <div className={ui.sectionHead}>
            <h2 className={ui.sectionHeadTitle}>Popular trips</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Scroll popular left"
                className={cn(ui.btn, ui.btnOutline, ui.btnSm, 'rounded-full px-2')}
                onClick={() => scrollStrip('popular-strip', -1)}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Scroll popular right"
                className={cn(ui.btn, ui.btnOutline, ui.btnSm, 'rounded-full px-2')}
                onClick={() => scrollStrip('popular-strip', 1)}
              >
                <ChevronRight size={16} />
              </button>
              <Link to="/events" className={ui.textLink}>
                See all
              </Link>
            </div>
          </div>
          <div id="popular-strip" className={ui.popularStrip}>
            <div className={ui.popularMosaic}>
              {popularTrips.map((e) => (
                <Link key={e.id} to={`/events/${e.id}`} className={ui.popularCard}>
                  <img src={e.image} alt="" className={ui.popularCardImg} />
                  <span className="min-w-0">
                    <strong className="block truncate text-[0.9rem]">{e.title}</strong>
                    <span className="mt-0.5 block text-[0.75rem] text-muted">
                      {e.date} · {e.area}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {!error && (
        <div className={ui.chipsSticky}>
          <CategoryChips selected={cat} onSelect={setCat} />
        </div>
      )}

      {!error && view === 'feed' ? (
        <>
          <section className={ui.stack}>
            <div className={ui.sectionHead}>
              <h2 className={ui.sectionHeadTitle}>{heading}</h2>
              <span className={cn(ui.mutedCount, 'inline-flex items-center gap-1.5')}>
                <SlidersHorizontal size={14} />
                {loading ? 'Loading…' : `${filteredPlaces.length} places`}
              </span>
            </div>

            {loading ? (
              <p className={ui.muted}>Loading places…</p>
            ) : filteredPlaces.length === 0 ? (
              <EmptyState
                icon={Compass}
                eyebrow="Places"
                title={places.length === 0 ? 'No places yet' : 'No matches'}
                description={
                  places.length === 0
                    ? 'Add venues in admin and their cover photos will show up here.'
                    : 'Nothing matches that search or filter. Clear filters and try again.'
                }
                action={
                  places.length === 0 && isAdmin ? (
                    <Link to="/admin/places" className={btn(ui.btnPrimary)}>
                      Add a place
                    </Link>
                  ) : places.length > 0 ? (
                    <button
                      type="button"
                      className={btn(ui.btnOutline)}
                      onClick={() => {
                        setCat('all')
                        setArea('all')
                        setQ('')
                      }}
                    >
                      Clear filters
                    </button>
                  ) : null
                }
              />
            ) : (
              <div className={ui.placeGrid}>
                {filteredPlaces.map((p) => (
                  <PlaceCard key={p.id} place={p} />
                ))}
              </div>
            )}
          </section>

          {filteredPosts.length > 0 && (
            <section className={ui.stack}>
              <div className={ui.sectionHead}>
                <h2 className={cn(ui.sectionHeadTitle, ui.igSectionTitle)}>
                  <Camera size={18} />
                  Around Jamaica
                </h2>
                <span className={ui.mutedCount}>{filteredPosts.length} posts</span>
              </div>
              <div className={ui.igFeed}>
                {filteredPosts.map((post) => (
                  <InstagramPostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : !error ? (
        <section className={ui.stack}>
          {loading ? (
            <p className={ui.muted}>Loading map…</p>
          ) : mapPlaces.length === 0 ? (
            <EmptyState
              icon={Compass}
              eyebrow="Map"
              title="No places to pin"
              description="Add venues in admin and they'll light up across Jamaica."
              action={
                isAdmin ? (
                  <Link to="/admin/places" className={btn(ui.btnPrimary)}>
                    Add a place
                  </Link>
                ) : null
              }
            />
          ) : (
            <>
              <div className={ui.mapPanel}>
                <div className={ui.mapCanvas}>
                  <PlacesMap
                    places={mapPlaces}
                    selectedId={activeId}
                    onSelect={setSelected}
                  />
                </div>

                {active && (
                  <div className="flex items-center gap-3 border-t border-border p-[0.85rem]">
                    <Link
                      to={`/place/${active.id}`}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <img
                        src={active.image}
                        alt=""
                        className="h-14 w-14 rounded-[0.85rem] object-cover"
                      />
                      <div>
                        <strong className="block text-[0.92rem]">{active.name}</strong>
                        <span className="inline-flex items-center gap-1 text-[0.78rem] text-muted">
                          <Star size={12} fill="currentColor" /> {active.rating} ·{' '}
                          {priceLabel(active.priceRange)} · {active.area}
                        </span>
                      </div>
                    </Link>
                    <button
                      type="button"
                      className={cn(
                        ui.btn,
                        ui.btnSm,
                        isFavorite(active.id) ? ui.btnPrimary : ui.btnOutline,
                      )}
                      onClick={() => toggleFavorite(active.id)}
                    >
                      {isFavorite(active.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {mapPlaces.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={cn(
                      'flex shrink-0 cursor-pointer items-center gap-[0.55rem] rounded-full border border-border bg-card py-1.5 pl-1.5 pr-[0.7rem] text-left text-[0.82rem] font-semibold',
                      activeId === p.id && 'border-primary bg-primary-soft text-primary',
                    )}
                    onClick={() => setSelected(p.id)}
                  >
                    <img src={p.image} alt="" className="h-8 w-8 rounded-full object-cover" />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      ) : null}

      {!error && view === 'feed' && events.length > 0 && popularTrips.length === 0 && (
        <section>
          <div className={ui.sectionHead}>
            <h2 className={ui.sectionHeadTitle}>Coming up on the island</h2>
            <Link to="/events" className={ui.textLink}>
              See all
            </Link>
          </div>
          <div className={ui.eventStrip}>
            {sortEvents(events)
              .slice(0, 8)
              .map((e) => (
                <EventCard key={e.id} event={e} compact />
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
