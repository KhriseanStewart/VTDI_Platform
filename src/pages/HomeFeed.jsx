import { useEffect, useMemo, useState } from 'react'
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
} from 'lucide-react'
import { AREAS, CATEGORY_LABELS, priceLabel } from '../data/outyahData'
import CategoryChips from '../components/CategoryChips'
import JamaicaPulse from '../components/JamaicaPulse'
import ShelfRow from '../components/ShelfRow'
import PlaceTile from '../components/PlaceTile'
import EventTile from '../components/EventTile'
import InstagramPostCard from '../components/InstagramPostCard'
import EmptyState from '../components/EmptyState'
import { PlacesMap } from '../components/maps/GoogleMaps'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useNow } from '../hooks/usePulse'
import { eventTiming, jamaicaClock, placeOpenState } from '../lib/pulse'
import { cn, ui, btn } from '../lib/ui'

/** Categories worth their own row, in the order they should appear. */
const SHELF_CATEGORIES = ['beach', 'restaurant', 'attraction', 'bar', 'cafe']
const CATEGORY_SUBTITLE = {
  beach: 'Sand, cliffs, and swim spots',
  restaurant: 'From jerk yards to fine dining',
  attraction: 'Waterfalls, history, and day trips',
  bar: 'Rum bars and late nights',
  cafe: 'Coffee, patties, and slow mornings',
}

const WEEKEND_DAYS = new Set(['Fri', 'Sat', 'Sun'])

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

  const now = useNow()

  const greetingName =
    profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'friend'

  useEffect(() => {
    const fromUrl = searchParams.get('q')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (fromUrl) setQ(fromUrl)
  }, [searchParams])

  // What the visitor's chips and search box actually produce.
  const { filteredPlaces, filteredPosts } = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const placeById = new Map(places.map((p) => [p.id, p]))

    let matchedPlaces = places.filter(
      (p) => (cat === 'all' || p.category === cat) && (area === 'all' || p.area === area),
    )
    if (needle) {
      matchedPlaces = matchedPlaces.filter(
        (p) =>
          p.name?.toLowerCase().includes(needle) ||
          p.area?.toLowerCase().includes(needle) ||
          p.neighborhood?.toLowerCase().includes(needle) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(needle)),
      )
    }

    let matchedPosts = posts
    if (cat !== 'all') {
      matchedPosts = matchedPosts.filter(
        (post) => placeById.get(post.placeId)?.category === cat,
      )
    }
    if (needle) {
      matchedPosts = matchedPosts.filter((post) => {
        const place = placeById.get(post.placeId)
        return (
          post.caption?.toLowerCase().includes(needle) ||
          post.username?.toLowerCase().includes(needle) ||
          place?.name?.toLowerCase().includes(needle) ||
          place?.area?.toLowerCase().includes(needle) ||
          place?.neighborhood?.toLowerCase().includes(needle)
        )
      })
    }

    return { filteredPlaces: matchedPlaces, filteredPosts: matchedPosts }
  }, [places, posts, cat, area, q])

  // Everything that moves with the clock, recomputed together on each tick.
  // Shelves are scoped to the parish only, so they stay browsable while the
  // chips and search box drive the results grid below them.
  const { clock, openStates, timings, tonight, weekend, openNow, topRated, categoryShelves } =
    useMemo(() => {
      const clock = jamaicaClock(now)
      const openStates = new Map(places.map((p) => [p.id, placeOpenState(p, clock)]))
      const timings = new Map(events.map((e) => [e.id, eventTiming(e, now, clock)]))

      const scopedPlaces = area === 'all' ? places : places.filter((p) => p.area === area)
      const scopedEvents = area === 'all' ? events : events.filter((e) => e.area === area)
      const bySoonest = (a, b) =>
        (timings.get(a.id)?.startsInMin ?? 0) - (timings.get(b.id)?.startsInMin ?? 0)

      return {
        clock,
        openStates,
        timings,
        tonight: scopedEvents
          .filter((e) => ['live', 'soon', 'today'].includes(timings.get(e.id)?.status))
          .sort(bySoonest),
        weekend: scopedEvents
          .filter((e) => {
            const t = timings.get(e.id)
            if (!t?.start || t.status === 'past') return false
            if (t.startsInMin != null && t.startsInMin > 60 * 24 * 8) return false
            return WEEKEND_DAYS.has(jamaicaClock(t.start).day)
          })
          .sort(bySoonest),
        openNow: scopedPlaces
          .filter((p) => openStates.get(p.id)?.open)
          .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)),
        topRated: scopedPlaces
          .filter((p) => Number(p.rating) > 0)
          .sort(
            (a, b) =>
              Number(b.rating) - Number(a.rating) || (b.reviewCount || 0) - (a.reviewCount || 0),
          )
          .slice(0, 12),
        categoryShelves: SHELF_CATEGORIES.map((key) => ({
          key,
          label: CATEGORY_LABELS[key] || key,
          subtitle: CATEGORY_SUBTITLE[key],
          items: scopedPlaces.filter((p) => p.category === key),
        })).filter((shelf) => shelf.items.length >= 3),
      }
    }, [places, events, area, now])

  const parishOptions = useMemo(() => {
    const present = new Set(places.map((p) => p.area).filter(Boolean))
    return AREAS.filter((a) => present.has(a))
  }, [places])

  const mapPlaces = filteredPlaces
  const activeId = selected || mapPlaces[0]?.id
  const active = places.find((p) => p.id === activeId) || mapPlaces[0]
  const heading = cat === 'all' ? 'All places' : CATEGORY_LABELS[cat]
  const scopeLabel = area === 'all' ? 'across Jamaica' : `in ${area}`

  // Filters active means the visitor is hunting for something specific — show
  // results directly instead of curated rows.
  const isFiltering = cat !== 'all' || q.trim().length > 0

  const clearFilters = () => {
    setCat('all')
    setArea('all')
    setQ('')
  }

  return (
    <div className={ui.stackLg}>
      <header>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={ui.kicker}>Wah gwaan, {greetingName}</p>
            <h1 className={ui.display}>Find a trip</h1>
            <p className={cn(ui.lede, 'mt-2 max-w-md text-[0.92rem]')}>
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

      {!error && !loading && (places.length > 0 || events.length > 0) && (
        <JamaicaPulse places={places} events={events} area={area} />
      )}

      {!error && (
        <div className={ui.chipsSticky}>
          <CategoryChips selected={cat} onSelect={setCat} />
        </div>
      )}

      {!error && view === 'feed' ? (
        <>
          {loading ? (
            <div className={ui.tileGrid} aria-busy="true">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i}>
                  <div className="skeleton aspect-square rounded-xl" />
                  <div className="skeleton mt-2.5 h-3.5 w-3/4 rounded" />
                  <div className="skeleton mt-1.5 h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {!isFiltering && (
                <>
                  {tonight.length >= 2 && (
                    <ShelfRow
                      title={`Happening tonight ${scopeLabel}`}
                      subtitle={`${clock.dayLong} — on now and starting soon`}
                      to="/events"
                    >
                      {tonight.map((e) => (
                        <EventTile key={e.id} event={e} timing={timings.get(e.id)} />
                      ))}
                    </ShelfRow>
                  )}

                  {openNow.length >= 3 && (
                    <ShelfRow
                      title="Open right now"
                      subtitle={`Doors open as of ${clock.clock}`}
                    >
                      {openNow.slice(0, 14).map((p) => (
                        <PlaceTile key={p.id} place={p} openState={openStates.get(p.id)} />
                      ))}
                    </ShelfRow>
                  )}

                  {weekend.length >= 2 && (
                    <ShelfRow
                      title="This weekend on the island"
                      subtitle="Friday through Sunday"
                      to="/events"
                    >
                      {weekend.map((e) => (
                        <EventTile key={e.id} event={e} timing={timings.get(e.id)} />
                      ))}
                    </ShelfRow>
                  )}

                  {topRated.length >= 3 && (
                    <ShelfRow
                      title={`Highest rated ${scopeLabel}`}
                      subtitle="Ranked by visitor reviews"
                    >
                      {topRated.map((p) => (
                        <PlaceTile key={p.id} place={p} openState={openStates.get(p.id)} />
                      ))}
                    </ShelfRow>
                  )}

                  {categoryShelves.map((shelf) => (
                    <ShelfRow key={shelf.key} title={shelf.label} subtitle={shelf.subtitle}>
                      {shelf.items.map((p) => (
                        <PlaceTile key={p.id} place={p} openState={openStates.get(p.id)} />
                      ))}
                    </ShelfRow>
                  ))}
                </>
              )}

              <section className={ui.stack}>
                <div className={ui.sectionHead}>
                  <h2 className={ui.sectionHeadTitle}>
                    {isFiltering ? heading : `All places ${scopeLabel}`}
                  </h2>
                  <span className={ui.mutedCount}>
                    <SlidersHorizontal size={14} />
                    {filteredPlaces.length} place{filteredPlaces.length === 1 ? '' : 's'}
                  </span>
                </div>

                {filteredPlaces.length === 0 ? (
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
                          onClick={clearFilters}
                        >
                          Clear filters
                        </button>
                      ) : null
                    }
                  />
                ) : (
                  <div className={ui.tileGrid}>
                    {filteredPlaces.map((p) => (
                      <PlaceTile
                        key={p.id}
                        place={p}
                        openState={openStates.get(p.id)}
                        wide
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

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
            <div className="skeleton h-[58vh] min-h-[440px] rounded-2xl" aria-busy="true" />
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
                  <div className="flex items-center gap-3 border-t border-border p-3">
                    <Link
                      to={`/place/${active.id}`}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <img
                        src={active.image}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <strong className="block truncate text-[0.92rem]">{active.name}</strong>
                        <span className="inline-flex items-center gap-1 text-[0.78rem] text-muted">
                          <Star size={12} fill="currentColor" className="text-accent" />{' '}
                          {active.rating} · {priceLabel(active.priceRange)} · {active.area}
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

              <div className={ui.rail}>
                {mapPlaces.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={cn(
                      ui.chip,
                      'gap-2.5 py-1.5 pl-1.5 pr-3',
                      activeId === p.id && 'border-primary bg-primary-soft text-primary',
                    )}
                    onClick={() => setSelected(p.id)}
                    aria-pressed={activeId === p.id}
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
    </div>
  )
}
