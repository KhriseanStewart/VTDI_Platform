import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { getPlace } from '../data/outyahData'
import { useApp } from '../context/AppContext'
import PlaceCard from '../components/PlaceCard'

export default function Favorites() {
  const { favorites } = useApp()
  const list = favorites.map((id) => getPlace(id)).filter(Boolean)

  return (
    <div className="stack-lg">
      <header>
        <p className="eyebrow">Saved for later</p>
        <h1 className="display">Favorites</h1>
      </header>

      {list.length === 0 ? (
        <div className="empty-card">
          <Heart size={28} />
          <p>Tap the heart on any place to save it here.</p>
          <Link to="/" className="btn btn-primary">
            Discover places
          </Link>
        </div>
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
