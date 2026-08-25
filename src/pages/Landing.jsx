import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { sortEvents, eventStatus } from '../lib/events'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import Logo, { TerobytezLockup } from '../components/Logo'
import JamaicaPulse from '../components/JamaicaPulse'
import PlaceCard from '../components/PlaceCard'
import EventCard from '../components/EventCard'
import { btn, cn, ui } from '../lib/ui'

const HERO_IMAGE =
  'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=2400'

const REGION_CHIPS = [
  {
    label: 'Negril',
    query: 'negril',
    match: (p) => /westmoreland|negril/i.test(`${p.area} ${p.neighborhood}`),
  },
  {
    label: 'Kingston',
    query: 'kingston',
    match: (p) => /kingston|st\.?\s*andrew/i.test(`${p.area}`),
  },
  {
    label: 'Montego Bay',
    query: 'montego',
    match: (p) => /st\.?\s*james|montego/i.test(`${p.area} ${p.neighborhood}`),
  },
  {
    label: 'Ocho Rios',
    query: 'ocho',
    match: (p) => /st\.?\s*ann|ocho/i.test(`${p.area} ${p.neighborhood}`),
  },
  {
    label: 'Portland',
    query: 'portland',
    match: (p) => /portland/i.test(`${p.area}`),
  },
  { label: 'Beaches', query: 'beach', match: (p) => p.category === 'beach' },
]

export default function Landing() {
  const { user } = useAuth()
  const { places, events, loading } = useData()
  const popularRef = useRef(null)

  const popular = useMemo(() => {
    return [...places]
      .filter((p) => p.image && Number(p.rating) > 0)
      .sort(
        (a, b) =>
          Number(b.rating) - Number(a.rating) ||
          (b.reviewCount || 0) - (a.reviewCount || 0),
      )
      .slice(0, 8)
  }, [places])

  const upcoming = useMemo(
    () =>
      sortEvents(events)
        .filter((e) => eventStatus(e) !== 'past')
        .slice(0, 6),
    [events],
  )

  const regions = useMemo(() => {
    return REGION_CHIPS.map((r) => {
      const hit = places.find(r.match)
      return {
        ...r,
        image: hit?.image || HERO_IMAGE,
        count: places.filter(r.match).length,
      }
    }).filter((r) => r.count > 0 || places.length === 0)
  }, [places])

  const scrollPopular = (dir) => {
    popularRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <section className="relative isolate min-h-dvh overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover motion-kenburns"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />

        <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 pt-5 sm:px-8">
          <Logo light />
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/explore"
              className="hidden text-sm font-semibold text-white/90 hover:text-white sm:inline"
            >
              Explore
            </Link>
            <Link
              to="/events"
              className="hidden text-sm font-semibold text-white/90 hover:text-white sm:inline"
            >
              Events
            </Link>
            <Link
              to={user ? '/explore' : '/auth?next=/explore'}
              className={btn(ui.btnPrimary, 'bg-white text-primary hover:bg-white/90')}
            >
              {user ? 'Open app' : 'Sign in'}
            </Link>
          </nav>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-5.5rem)] w-full max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-8 sm:pb-20">
          <div className="motion-fade-up mb-5">
            <TerobytezLockup height={48} className="drop-shadow-md" />
          </div>
          <p className="motion-fade-up motion-delay-1 mb-3 font-display text-[clamp(2.6rem,8vw,5.2rem)] font-extrabold leading-[0.95] tracking-tight text-white">
            OutYah
          </p>
          <h1 className="motion-fade-up motion-delay-2 max-w-xl font-display text-[clamp(1.45rem,3.2vw,2.15rem)] font-bold leading-snug text-white/95">
            Find your next outing across Jamaica
          </h1>
          <p className="motion-fade-up motion-delay-3 mt-3 max-w-md text-[1.05rem] leading-relaxed text-white/80">
            Beaches, jerk yards, waterfalls, and weekend energy — discover places and events from
            Negril to Kingston.
          </p>
          <div className="motion-fade-up motion-delay-3 mt-8 flex flex-wrap items-center gap-3">
            <Link to="/explore" className={btn(ui.btnPrimary, 'px-6 py-3 text-base')}>
              Start exploring <ArrowRight size={18} />
            </Link>
            <Link
              to="/events"
              className={btn(
                'border border-white/35 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20',
              )}
            >
              See events
            </Link>
          </div>
        </div>
      </section>

      {(places.length > 0 || events.length > 0) && (
        <section className="mx-auto -mt-10 w-full max-w-6xl px-4 sm:-mt-14 sm:px-8">
          <div className="relative z-10">
            <JamaicaPulse places={places} events={events} compact />
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
        <div className="mb-8 max-w-xl">
          <p className={ui.eyebrow}>Where to go</p>
          <h2 className={ui.display}>Destinations across the island</h2>
          <p className={cn(ui.lede, 'mt-2')}>
            Jump into a parish or vibe — then dig into the full map and feed.
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 rail-scroll">
          {regions.map((r) => (
            <Link
              key={r.label}
              to={`/explore?q=${encodeURIComponent(r.query)}`}
              className={cn(
                'group relative h-56 w-[8.5rem] shrink-0 overflow-hidden rounded-2xl shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] sm:h-64 sm:w-40',
                ui.focus,
              )}
            >
              <img
                src={r.image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
              />
              <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.15)_55%)]" />
              <span className="absolute inset-x-0 bottom-0 p-3.5">
                <span className="block font-display text-[0.98rem] font-bold text-white">
                  {r.label}
                </span>
                {r.count > 0 && (
                  <span className="text-[0.72rem] font-semibold text-white/70">
                    {r.count} place{r.count === 1 ? '' : 's'}
                  </span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-[color-mix(in_oklab,var(--color-card)_70%,var(--color-bg))] py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className={ui.eyebrow}>Popular spots</p>
              <h2 className={ui.display}>Places people love</h2>
            </div>
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                aria-label="Scroll left"
                className={cn(ui.iconBtn, 'rounded-full border border-border bg-card')}
                onClick={() => scrollPopular(-1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Scroll right"
                className={cn(ui.iconBtn, 'rounded-full border border-border bg-card')}
                onClick={() => scrollPopular(1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {loading && popular.length === 0 ? (
            <div className="flex gap-3 overflow-hidden" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton aspect-9/16 w-[13.5rem] shrink-0 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div ref={popularRef} className="flex gap-3 overflow-x-auto pb-2 rail-scroll">
              {popular.map((p) => (
                <PlaceCard key={p.id} place={p} compact />
              ))}
              {popular.length === 0 && !loading && (
                <p className={ui.muted}>Places will show here once the catalog is loaded.</p>
              )}
            </div>
          )}

          <div className="mt-8">
            <Link to="/explore" className={ui.textLink}>
              Browse all places <ArrowRight size={14} className="inline" />
            </Link>
          </div>
        </div>
      </section>

      {upcoming.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className={ui.eyebrow}>On the calendar</p>
              <h2 className={ui.display}>Coming up on the island</h2>
            </div>
            <Link to="/events" className={ui.textLink}>
              See all
            </Link>
          </div>
          <div className={ui.eventGrid}>
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      <section className="relative overflow-hidden border-t border-border bg-primary px-4 py-16 text-on-primary sm:px-8 sm:py-20">
        <div
          className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-accent/25 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
              <Sparkles size={16} /> Ready when you are
            </p>
            <h2 className="font-display text-[clamp(1.5rem,3vw,2.1rem)] font-extrabold">
              Plan the outing. Save the spots. Move out.
            </h2>
            <p className="mt-2 text-on-primary/80">
              Browse the map, favourite venues, and build a stop-by-stop plan — all free.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/explore"
              className={btn('bg-white text-primary hover:bg-white/90 px-6 py-3')}
            >
              Explore Jamaica
            </Link>
            {!user && (
              <Link
                to="/auth?next=/explore"
                className={btn(
                  'border border-white/40 bg-transparent text-white hover:bg-white/10',
                )}
              >
                Create account
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-fg px-4 py-10 text-white/70 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3">
            <Logo light />
            <TerobytezLockup height={28} className="opacity-90" />
          </div>
          <nav className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link to="/explore" className="hover:text-white">
              Explore
            </Link>
            <Link to="/events" className="hover:text-white">
              Events
            </Link>
            <Link to="/plan" className="hover:text-white">
              Plan
            </Link>
            <Link to={user ? '/profile' : '/auth'} className="hover:text-white">
              {user ? 'Profile' : 'Sign in'}
            </Link>
          </nav>
          <p className="text-xs text-white/45">
            OutYah by Terobytez · Jamaica outing discovery
          </p>
        </div>
      </footer>
    </div>
  )
}
