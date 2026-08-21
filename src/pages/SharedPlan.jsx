import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { MapPin, Navigation, Route, Share2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { RouteMap } from '../components/maps/GoogleMaps'
import EmptyState from '../components/EmptyState'
import { decodeStopsQuery, fetchSharedPlan } from '../lib/sharePlan'
import { directionsUrl } from '../lib/maps'
import { btn, cn, ui } from '../lib/ui'

export default function SharedPlan() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { getPlace, loading: placesLoading } = useData()
  const { mergePlan } = useApp()
  const [placeIds, setPlaceIds] = useState([])
  const [title, setTitle] = useState('Shared outing')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [imported, setImported] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setStatus('loading')
      setError('')
      try {
        if (id) {
          const row = await fetchSharedPlan(id)
          if (cancelled) return
          if (!row || !row.placeIds.length) {
            setStatus('missing')
            return
          }
          setPlaceIds(row.placeIds)
          setTitle(row.title || 'Shared outing')
          setStatus('ready')
          return
        }
        const fromQuery = decodeStopsQuery(params)
        if (!fromQuery.length) {
          setStatus('missing')
          return
        }
        setPlaceIds(fromQuery)
        setTitle('Shared outing')
        setStatus('ready')
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load shared plan')
          setStatus('error')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, params])

  const stops = useMemo(
    () => placeIds.map((pid) => getPlace(pid)).filter(Boolean),
    [placeIds, getPlace],
  )

  function importPlan() {
    mergePlan(placeIds)
    setImported(true)
  }

  if (status === 'loading' || placesLoading) {
    return <p className={ui.muted}>Loading shared plan…</p>
  }

  if (status === 'missing') {
    return (
      <EmptyState
        icon={Share2}
        eyebrow="Share link"
        title="Plan not found"
        description="This link may have expired or the stops were removed."
        action={
          <Link to="/plan" className={btn(ui.btnPrimary)}>
            Open your planner
          </Link>
        }
      />
    )
  }

  if (status === 'error') {
    return (
      <EmptyState
        icon={Share2}
        tone="warn"
        title="Couldn't open plan"
        description={error}
        action={
          <Link to="/plan" className={btn(ui.btnPrimary)}>
            Back to planner
          </Link>
        }
      />
    )
  }

  return (
    <div className={ui.stackLg}>
      <header>
        <p className={ui.eyebrow}>Shared with you</p>
        <h1 className={ui.display}>{title}</h1>
        <p className={ui.lede}>
          {stops.length} stop{stops.length === 1 ? '' : 's'} · view the route, then add it to your
          planner.
        </p>
      </header>

      {stops.length === 0 ? (
        <EmptyState
          icon={Route}
          title="Stops unavailable"
          description="The places on this plan are no longer in the catalog."
        />
      ) : (
        <div className="grid gap-5 min-[900px]:grid-cols-2 min-[900px]:items-start">
          <div className={ui.stack}>
            <ol className="m-0 overflow-hidden rounded-[1.35rem] border border-border bg-border p-0">
              {stops.map((p, i) => (
                <li
                  key={p.id}
                  className="grid grid-cols-[auto_auto_1fr] items-center gap-3 border-b border-border bg-card p-3 last:border-b-0"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[0.8rem] font-bold text-on-primary">
                    {i + 1}
                  </span>
                  <img src={p.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <Link to={`/place/${p.id}`} className="font-bold hover:text-primary">
                      {p.name}
                    </Link>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[0.78rem] text-muted">
                      <MapPin size={12} /> {p.neighborhood}, {p.area}
                    </p>
                  </div>
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
                className={btn(imported ? ui.btnSecondary : ui.btnOutline)}
                onClick={importPlan}
              >
                {imported ? 'Added to your plan' : 'Add to my plan'}
              </button>
              <Link to="/plan" className={btn(ui.btnOutline)}>
                Open planner
              </Link>
            </div>
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
      )}
    </div>
  )
}
