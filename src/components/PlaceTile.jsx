import { Link } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import { priceLabel } from '../data/outyahData'
import { useApp } from '../context/AppContext'
import { cn, ui } from '../lib/ui'

/**
 * Compact browse card for a place: square still, live open/closed badge, and
 * the key facts underneath. Used inside shelf rows and tile grids.
 */
export default function PlaceTile({ place, openState, wide = false }) {
  const { isFavorite, toggleFavorite } = useApp()
  const fav = isFavorite(place.id)
  const location = [place.neighborhood, place.area].filter(Boolean).join(', ')

  let badge = null
  if (openState?.open && openState.closingSoon && openState.closesAt) {
    badge = { text: `Closes ${openState.closesAt}`, tone: ui.tileBadgeLive }
  } else if (openState?.open) {
    badge = { text: 'Open now', tone: ui.tileBadgeSoon }
  } else if (openState && !openState.open && openState.opensAt) {
    badge = { text: `Opens ${openState.opensAt}`, tone: null }
  } else if (Number(place.rating) >= 4.7) {
    badge = { text: 'Local favourite', tone: null }
  }

  return (
    <article className={cn(ui.tile, wide && ui.tileWide)}>
      <Link to={`/place/${place.id}`} className={ui.tileMedia}>
        <img src={place.image} alt={place.name} loading="lazy" className={ui.tileImg} />
        {badge && <span className={cn(ui.tileBadge, badge.tone)}>{badge.text}</span>}
      </Link>

      <button
        type="button"
        className={cn(ui.tileFav, fav && ui.tileFavOn)}
        onClick={() => toggleFavorite(place.id)}
        aria-label={fav ? `Remove ${place.name} from favorites` : `Save ${place.name}`}
        aria-pressed={fav}
      >
        <Heart size={18} fill={fav ? 'currentColor' : 'rgba(0,0,0,0.25)'} />
      </button>

      <Link to={`/place/${place.id}`} className={ui.tileBody}>
        <span className={ui.tileTitle}>{place.name}</span>
        {location && <span className={ui.tileMeta}>{location}</span>}
        <span className={ui.tileFoot}>
          {Number(place.rating) > 0 && (
            <span className="inline-flex items-center gap-1 font-semibold text-fg">
              <Star size={12} fill="currentColor" className="text-accent" />
              {place.rating}
            </span>
          )}
          {place.priceRange && <span>{priceLabel(place.priceRange)}</span>}
        </span>
      </Link>
    </article>
  )
}
