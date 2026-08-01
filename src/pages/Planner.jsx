import { Link } from 'react-router-dom'
import { GripVertical, Trash2, Navigation, MapPin, Route } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { RouteMap } from '../components/maps/GoogleMaps'
import EmptyState from '../components/EmptyState'
import { directionsUrl } from '../lib/maps'
import { btn, cn, ui } from '../lib/ui'

export default function Planner() {
  const { plan, removeFromPlan, addToPlan, clearPlan } = useApp()
  const { places, getPlace, loading } = useData()
  const { user } = useAuth()
  const stops = plan.map((id) => getPlace(id)).filter(Boolean)
  const suggestions = places.filter((p) => !plan.includes(p.id)).slice(0, 6)

  return (
    <div className={ui.stackLg}>
      <header>
        <p className={ui.eyebrow}>Build your night</p>
        <h1 className={ui.display}>Outing planner</h1>
        <p className={ui.lede}>
          Stack stops across Kingston, MoBay, Ochi or Negril — then get directions in order.
        </p>
      </header>

      {!user && (
        <p className={ui.igSourceNote}>
          <Link to="/auth?next=/plan" className={ui.textLink}>
            Sign in
          </Link>{' '}
          to save your outing plan across devices.
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
              description="Build a route — add places from the feed, or tap a suggestion below."
              action={
                <Link to="/" className={btn(ui.btnPrimary)}>
                  Browse feed
                </Link>
              }
            />
          ) : (
            <div className={ui.stack}>
              <ol className="m-0 grid list-none gap-[0.65rem] p-0">
                {stops.map((p, i) => (
                  <li
                    key={p.id}
                    className="grid grid-cols-[auto_auto_auto_1fr_auto] items-center gap-[0.65rem] rounded-[0.9rem] border border-border bg-card p-[0.65rem]"
                  >
                    <span className="grid h-[1.7rem] w-[1.7rem] place-items-center rounded-full bg-primary text-[0.8rem] font-bold text-primary-fg">
                      {i + 1}
                    </span>
                    <GripVertical size={16} className={ui.muted} />
                    <img src={p.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    <div>
                      <strong className="block">{p.name}</strong>
                      <span className="inline-flex items-center gap-1 text-[0.78rem] text-muted">
                        <MapPin size={12} /> {p.neighborhood}, {p.area}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={ui.iconBtn}
                      onClick={() => removeFromPlan(p.id)}
                      aria-label="Remove"
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
                <button type="button" className={btn(ui.btnOutline)} onClick={clearPlan}>
                  Clear plan
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={ui.mapPanel}>
          <div className={cn(ui.mapCanvas, ui.mapCanvasSm, 'min-[900px]:h-[420px] min-[900px]:min-h-[420px]')}>
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
          <div className="mt-3.5 grid gap-[0.65rem]">
            {suggestions.map((p) => (
              <button
                key={p.id}
                type="button"
                className="grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-border bg-card p-[0.55rem] text-left"
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
                <em className="text-[0.85rem] font-bold not-italic text-primary">+ Add</em>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
