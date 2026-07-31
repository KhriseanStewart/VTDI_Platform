import { Link } from 'react-router-dom'
import { GripVertical, Trash2, Navigation, MapPin, Route } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { RouteMap } from '../components/maps/GoogleMaps'
import EmptyState from '../components/EmptyState'
import { directionsUrl } from '../lib/maps'

export default function Planner() {
  const { plan, removeFromPlan, addToPlan, clearPlan } = useApp()
  const { places, getPlace, loading } = useData()
  const { user } = useAuth()
  const stops = plan.map((id) => getPlace(id)).filter(Boolean)
  const suggestions = places.filter((p) => !plan.includes(p.id)).slice(0, 6)

  return (
    <div className="stack-lg">
      <header>
        <p className="eyebrow">Build your night</p>
        <h1 className="display">Outing planner</h1>
        <p className="lede">
          Stack stops across Kingston, MoBay, Ochi or Negril — then get directions in order.
        </p>
      </header>

      {!user && (
        <p className="ig-source-note">
          <Link to="/auth?next=/plan" className="text-link">
            Sign in
          </Link>{' '}
          to save your outing plan across devices.
        </p>
      )}

      <div className="planner-layout">
        <div className="stack">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : stops.length === 0 ? (
            <EmptyState
              icon={Route}
              eyebrow="Planner"
              title="No stops yet"
              description="Build a route — add places from the feed, or tap a suggestion below."
              action={
                <Link to="/" className="btn btn-primary">
                  Browse feed
                </Link>
              }
            />
          ) : (
            <div className="stack">
              <ol className="plan-list">
                {stops.map((p, i) => (
                  <li key={p.id} className="plan-item">
                    <span className="plan-num">{i + 1}</span>
                    <GripVertical size={16} className="muted" />
                    <img src={p.image} alt="" />
                    <div>
                      <strong>{p.name}</strong>
                      <span>
                        <MapPin size={12} /> {p.neighborhood}, {p.area}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => removeFromPlan(p.id)}
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ol>
              <div className="action-row">
                <a
                  className="btn btn-primary"
                  href={directionsUrl(stops)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Navigation size={18} />
                  Get directions
                </a>
                <button type="button" className="btn btn-outline" onClick={clearPlan}>
                  Clear plan
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="map-panel planner-map">
          <div className="map-canvas map-canvas-sm">
            <RouteMap stops={stops} />
          </div>
        </div>
      </div>

      <section>
        <h2>Suggested stops</h2>
        {suggestions.length === 0 ? (
          <EmptyState
            icon={MapPin}
            eyebrow="Suggestions"
            title="No venues to suggest"
            description="Once places exist in Supabase, we'll recommend stops you haven't added yet."
          />
        ) : (
          <div className="suggest-grid">
            {suggestions.map((p) => (
              <button
                key={p.id}
                type="button"
                className="suggest-card"
                onClick={() => addToPlan(p.id)}
              >
                <img src={p.image} alt="" />
                <span>
                  <strong>{p.name}</strong>
                  <small>{p.area}</small>
                </span>
                <em>+ Add</em>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
