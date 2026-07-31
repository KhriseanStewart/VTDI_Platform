import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import PlaceCard from '../components/PlaceCard'
import EmptyState from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

export default function Favorites() {
  const { favorites } = useApp()
  const { getPlace, loading } = useData()
  const { user } = useAuth()
  const list = favorites.map((id) => getPlace(id)).filter(Boolean)

  return (
    <div className="stack-lg">
      <header>
        <p className="eyebrow">Saved for later</p>
        <h1 className="display">Favorites</h1>
      </header>

      {!user && (
        <p className="ig-source-note">
          Signed out — favorites stay on this device.{' '}
          <Link to="/auth?next=/favorites" className="text-link">
            Sign in
          </Link>{' '}
          to sync across devices.
        </p>
      )}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Heart}
          tone="coral"
          eyebrow="Favorites"
          title="Your list is empty"
          description="Tap the heart on any place in the feed or map — your shortlist will live here."
          action={
            <Link to="/" className="btn btn-primary">
              Discover places
            </Link>
          }
        />
      ) : (
        <div className="place-grid">
          {list.map((p) => (
            <PlaceCard key={p.id} place={p} />
          ))}
        </div>
      )}
    </div>
  )
}
