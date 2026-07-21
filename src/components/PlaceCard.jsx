import { Link } from 'react-router-dom'
import { MapPin, Star, Heart } from 'lucide-react'
import {
  CATEGORY_SINGULAR,
  CATEGORY_COLOR,
  priceLabel,
} from '../data/outyahData'
import { useApp } from '../context/AppContext'

function tagClass(tag) {
  const t = tag.toLowerCase()
  if (t.includes('off') || t.includes('free') || t.includes('happy'))
    return 'tag tag-gold'
  if (t.includes('closes soon')) return 'tag tag-danger'
  if (
    t.includes('live') ||
    t.includes('tonight') ||
    t.includes('open now') ||
    t.includes('fever')
  )
    return 'tag tag-green'
  return 'tag'
}

export default function PlaceCard({ place }) {
  const { isFavorite, toggleFavorite } = useApp()
  const fav = isFavorite(place.id)

  return (
    <article className="place-card">
      <Link to={`/place/${place.id}`} className="place-card-media">
        <img src={place.image} alt={place.name} loading="lazy" />
        <span
          className="cat-badge"
          style={{ background: CATEGORY_COLOR[place.category] }}
        >
          {CATEGORY_SINGULAR[place.category]}
        </span>
        <button
          type="button"
          className={`fav-btn${fav ? ' is-on' : ''}`}
          aria-label={fav ? 'Remove favorite' : 'Save favorite'}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleFavorite(place.id)
          }}
        >
          <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
        </button>
        <div className="place-card-tags">
          {place.tags.slice(0, 2).map((tag) => (
            <span key={tag} className={tagClass(tag)}>
              {tag}
            </span>
          ))}
        </div>
      </Link>

      <Link to={`/place/${place.id}`} className="place-card-body">
        <div className="place-card-title-row">
          <h3>{place.name}</h3>
          <span className="rating">
            <Star size={14} fill="currentColor" />
            {place.rating}
          </span>
        </div>
        <p className="place-meta">
          <MapPin size={13} />
          {place.neighborhood}, {place.area}
        </p>
        <p className="place-submeta">
          <strong>{priceLabel(place.priceRange)}</strong>
          <span>·</span>
          {place.reviewCount.toLocaleString()} reviews
        </p>
      </Link>
    </article>
  )
}
