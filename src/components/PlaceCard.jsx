import { Link } from 'react-router-dom'
import { MapPin, Star, Heart } from 'lucide-react'
import {
  CATEGORY_SINGULAR,
  CATEGORY_COLOR,
  priceLabel,
} from '../data/outyahData'
import { useApp } from '../context/AppContext'
import { cn, ui } from '../lib/ui'

function tagClass(tag) {
  const t = tag.toLowerCase()
  if (t.includes('off') || t.includes('free') || t.includes('happy'))
    return cn(ui.tag, ui.tagGold)
  if (t.includes('closes soon')) return cn(ui.tag, ui.tagDanger)
  if (
    t.includes('live') ||
    t.includes('tonight') ||
    t.includes('open now') ||
    t.includes('fever')
  )
    return cn(ui.tag, ui.tagGreen)
  return ui.tag
}

export default function PlaceCard({ place }) {
  const { isFavorite, toggleFavorite } = useApp()
  const fav = isFavorite(place.id)

  return (
    <article className={ui.placeCard}>
      <Link to={`/place/${place.id}`} className={ui.placeCardMedia}>
        <img
          src={place.image}
          alt={place.name}
          loading="lazy"
          className={ui.placeCardImg}
        />
        <span
          className={ui.catBadge}
          style={{ background: CATEGORY_COLOR[place.category] }}
        >
          {CATEGORY_SINGULAR[place.category]}
        </span>
        <button
          type="button"
          className={cn(ui.favBtn, fav && ui.favBtnOn)}
          aria-label={fav ? 'Remove favorite' : 'Save favorite'}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleFavorite(place.id)
          }}
        >
          <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
        </button>
        <div className={ui.placeCardTags}>
          {place.tags.slice(0, 2).map((tag) => (
            <span key={tag} className={tagClass(tag)}>
              {tag}
            </span>
          ))}
        </div>
      </Link>

      <Link to={`/place/${place.id}`} className={ui.placeCardBody}>
        <div className={ui.placeCardTitleRow}>
          <h3 className={ui.placeCardTitle}>{place.name}</h3>
          <span className={ui.rating}>
            <Star size={14} fill="currentColor" />
            {place.rating}
          </span>
        </div>
        <p className={ui.placeMeta}>
          <MapPin size={13} />
          {place.neighborhood}, {place.area}
        </p>
        <p className={ui.placeSubmeta}>
          <strong>{priceLabel(place.priceRange)}</strong>
          <span>·</span>
          {place.reviewCount.toLocaleString()} reviews
        </p>
      </Link>
    </article>
  )
}
