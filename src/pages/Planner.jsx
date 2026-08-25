import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Trash2,
  Navigation,
  MapPin,
  Route,
  Share2,
  ChevronUp,
  ChevronDown,
  Plus,
  Star,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { RouteMap } from '../components/maps/GoogleMaps'
import EmptyState from '../components/EmptyState'
import CostEstimate from '../components/CostEstimate'
import SharePlanSheet from '../components/SharePlanSheet'
import { priceLabel } from '../data/outyahData'
import { directionsUrl } from '../lib/maps'
import { btn, cn, ui } from '../lib/ui'

const SUGGESTION_LIMIT = 8

export default function Planner() {
  const { plan, removeFromPlan, addToPlan, clearPlan, movePlanStop } = useApp()
  const { places, getPlace, loading } = useData()
  const { user } = useAuth()
  const [shareOpen, setShareOpen] = useState(false)
  const stops = plan.map((id) => getPlace(id)).filter(Boolean)

  // rank by parish match with the current plan, then rating — not alphabetical
  const { suggestions, suggestionNote } = useMemo(() => {
    const inPlan = new Set(plan)
    const areas = new Set(
      plan.map((id) => places.find((p) => p.id === id)?.area).filter(Boolean),
    )

    const ranked = places
      .filter((p) => !inPlan.has(p.id))
      .map((p) => ({
        place: p,
        near: areas.has(p.area) ? 1 : 0,
        rating: Number(p.rating) || 0,
        reviews: Number(p.reviewCount) || 0,
      }))
      .sort((a, b) => b.near - a.near || b.rating - a.rating || b.reviews - a.reviews)
      .slice(0, SUGGESTION_LIMIT)
      .map((s) => s.place)

    const list = [...areas]
    const where =
      list.length === 0
        ? ''
        : list.length <= 2
          ? list.join(' and ')
          : `${list.slice(0, 2).join(', ')} and more`

    return {
      suggestions: ranked,
      suggestionNote: where
        ? `Top rated near your stops in ${where}`
        : 'Highest rated across the island',
    }
  }, [places, plan])

  return (
    <div className={ui.stackLg}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={ui.eyebrow}>Build your night</p>
          <h1 className={ui.display}>Outing planner</h1>
          <p className={ui.lede}>
            Stack stops across the island — get directions, then share the plan with friends.
          </p>
        </div>
        {stops.length > 0 && (
          <button
            type="button"
            className={btn(ui.btnPrimary)}
            onClick={() => setShareOpen(true)}
          >
            <Share2 size={18} />
            Share plan
          </button>
        )}
      </header>

      {!user && (
        <p className={ui.note}>
          <Link to="/auth?next=/plan" className={ui.textLink}>
            Sign in
          </Link>{' '}
          to sync your plan across devices. Share links work for everyone.
        </p>
      )}

      <div className="grid gap-5 min-[900px]:grid-cols-2 min-[900px]:items-start">
        <div className={ui.stack}>
          {loading ? (
            <p className={ui.muted}>Loading…</p>
          ) : stops.length === 0 ? (
            <EmptyState
              icon={Route}
              eyebrow="Planner"
              title="No stops yet"
              description="Build a route — add places from Explore, or tap a suggestion below."
              action={
                <Link to="/explore" className={btn(ui.btnPrimary)}>
                  Browse places
                </Link>
              }
            />
          ) : (
            <div className={ui.stack}>
              <ol className={cn(ui.listGroup, 'm-0 p-0')}>
                {stops.map((p, i) => (
                  <li
                    key={p.id}
                    className="grid grid-cols-[auto_auto_auto_1fr_auto] items-center gap-2.5 p-3"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[0.8rem] font-bold text-on-primary">
                      {i + 1}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        className={ui.iconBtn}
                        disabled={i === 0}
                        aria-label={`Move ${p.name} up`}
                        onClick={() => movePlanStop(p.id, 'up')}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        className={ui.iconBtn}
                        disabled={i === stops.length - 1}
                        aria-label={`Move ${p.name} down`}
                        onClick={() => movePlanStop(p.id, 'down')}
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                    <img src={p.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    <div>
                      <Link to={`/place/${p.id}`} className="font-bold hover:text-primary">
                        {p.name}
                      </Link>
                      <span className="mt-0.5 flex items-center gap-1 text-[0.78rem] text-muted">
                        <MapPin size={12} /> {p.neighborhood}, {p.area}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={ui.iconBtn}
                      onClick={() => removeFromPlan(p.id)}
                      aria-label={`Remove ${p.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ol>
              <div className={ui.actionRow}>
                <a
                  className={btn(ui.btnPrimary)}
                  href={directionsUrl(stops)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Navigation size={18} />
                  Get directions
                </a>
                <button
                  type="button"
                  className={btn(ui.btnOutline)}
                  onClick={() => setShareOpen(true)}
                >
                  <Share2 size={16} />
                  Share
                </button>
                <button type="button" className={btn(ui.btnOutline)} onClick={clearPlan}>
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={ui.stack}>
          <CostEstimate places={stops} />
          <div className={ui.mapPanel}>
            <div
              className={cn(
                ui.mapCanvas,
                ui.mapCanvasSm,
                'min-[900px]:h-[420px] min-[900px]:min-h-[420px]',
              )}
            >
              <RouteMap stops={stops} />
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className={ui.sectionHead}>
          <div>
            <h2 className={ui.sectionHeadTitle}>Suggested stops</h2>
            <p className={cn(ui.small, 'mt-0.5')}>{suggestionNote}</p>
          </div>
          <Link to="/explore" className={ui.textLink}>
            Browse all
          </Link>
        </div>
        {suggestions.length === 0 ? (
          <EmptyState
            icon={MapPin}
            eyebrow="Suggestions"
            title="No venues to suggest"
            description="Once places exist in Supabase, we'll recommend stops you haven't added yet."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {suggestions.map((p) => (
              <article
                key={p.id}
                className={cn(ui.cardFlat, ui.cardHover, 'flex items-center gap-3 p-2.5')}
              >
                <Link to={`/place/${p.id}`} className={cn('shrink-0 rounded-xl', ui.focus)}>
                  <img
                    src={p.image}
                    alt=""
                    loading="lazy"
                    className="h-16 w-16 rounded-xl bg-border object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    to={`/place/${p.id}`}
                    className={cn(
                      'block truncate text-[0.95rem] font-bold hover:text-primary',
                      ui.focus,
                    )}
                  >
                    {p.name}
                  </Link>
                  <span className="mt-0.5 flex items-center gap-1 truncate text-[0.8rem] text-muted">
                    <MapPin size={12} className="shrink-0" />
                    {[p.neighborhood, p.area].filter(Boolean).join(', ')}
                  </span>
                  <span className="mt-1 flex items-center gap-2 text-[0.8rem] text-muted">
                    {Number(p.rating) > 0 && (
                      <span className="inline-flex items-center gap-1 font-semibold text-fg">
                        <Star size={12} fill="currentColor" className="text-accent" />
                        {p.rating}
                      </span>
                    )}
                    {p.priceRange > 0 && <span>{priceLabel(p.priceRange)}</span>}
                  </span>
                </div>

                <button
                  type="button"
                  className={cn(btn(ui.btnOutline), ui.btnSm, 'shrink-0')}
                  onClick={() => addToPlan(p.id)}
                  aria-label={`Add ${p.name} to your plan`}
                >
                  <Plus size={15} />
                  Add
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <SharePlanSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        placeIds={plan}
        planTitle={
          stops.length
            ? `OutYah plan · ${stops.map((s) => s.name).slice(0, 2).join(', ')}${stops.length > 2 ? '…' : ''}`
            : 'OutYah outing plan'
        }
      />
    </div>
  )
}
