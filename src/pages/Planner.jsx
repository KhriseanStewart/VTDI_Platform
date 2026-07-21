import { Link } from 'react-router-dom'
import { GripVertical, Trash2, Navigation, MapPin } from 'lucide-react'
import { places, getPlace } from '../data/outyahData'
import { useApp } from '../context/AppContext'
import { RouteMap } from '../components/maps/GoogleMaps'
import { directionsUrl } from '../lib/maps'

export default function Planner() {
  const { plan, removeFromPlan, addToPlan, clearPlan } = useApp()
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

      <div className="planner-layout">
        <div className="stack">
          {stops.length === 0 ? (
            <div className="empty-card">
              <p>No stops yet. Add places from the feed or pick a suggestion below.</p>
              <Link to="/" className="btn btn-primary">
                Browse feed
              </Link>
            </div>
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
      </section>
    </div>
  )
}
