import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Navigation, MapPin, Route, Share2, ChevronUp, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { RouteMap } from '../components/maps/GoogleMaps'
import EmptyState from '../components/EmptyState'
import SharePlanSheet from '../components/SharePlanSheet'
import { directionsUrl } from '../lib/maps'
import { btn, cn, ui } from '../lib/ui'

export default function Planner() {
  const { plan, removeFromPlan, addToPlan, clearPlan, movePlanStop } = useApp()
  const { places, getPlace, loading } = useData()
  const { user } = useAuth()
  const [shareOpen, setShareOpen] = useState(false)
  const stops = plan.map((id) => getPlace(id)).filter(Boolean)
  const suggestions = places.filter((p) => !plan.includes(p.id)).slice(0, 6)

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
        <p className={ui.igSourceNote}>
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
              <ol className="m-0 overflow-hidden rounded-[1.35rem] border border-border bg-border p-0">
                {stops.map((p, i) => (
                  <li
                    key={p.id}
                    className="grid grid-cols-[auto_auto_auto_1fr_auto] items-center gap-[0.65rem] border-b border-border bg-card p-3 last:border-b-0"
                  >
                    <span className="grid h-[1.7rem] w-[1.7rem] place-items-center rounded-full bg-primary text-[0.8rem] font-bold text-on-primary">
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

      <section>
        <h2 className={ui.sectionHeadTitle}>Suggested stops</h2>
        {suggestions.length === 0 ? (
          <EmptyState
            icon={MapPin}
            eyebrow="Suggestions"
            title="No venues to suggest"
            description="Once places exist in Supabase, we'll recommend stops you haven't added yet."
          />
        ) : (
          <div className="mt-3.5 overflow-hidden rounded-[1.35rem] border border-border bg-border">
            {suggestions.map((p) => (
              <button
                key={p.id}
                type="button"
                className="grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border bg-card p-3 text-left last:border-b-0 hover:bg-[color-mix(in_oklab,var(--color-primary)_5%,var(--color-card))]"
                onClick={() => addToPlan(p.id)}
              >
                <img
                  src={p.image}
                  alt=""
                  className="h-[3.25rem] w-[3.25rem] rounded-[0.85rem] object-cover"
                />
                <span>
                  <strong className="block">{p.name}</strong>
                  <small className="block text-muted">{p.area}</small>
                </span>
                <em className="text-[0.85rem] font-bold not-italic text-primary">Add</em>
              </button>
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
