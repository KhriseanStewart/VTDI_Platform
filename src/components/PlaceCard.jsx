import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Plus, Share2 } from 'lucide-react'
import { CATEGORY_SINGULAR, priceLabel } from '../data/outyahData'
import { useApp } from '../context/AppContext'
import MediaReel from './MediaReel'
import { reelHandle, reelHashtags, shareReel } from '../lib/reelMeta'

function formatCount(n) {
  if (!n) return ''
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`
  return String(n)
}

export default function PlaceCard({ place, compact = false }) {
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite, isInPlan, togglePlan } = useApp()
  const fav = isFavorite(place.id)
  const inPlan = isInPlan(place.id)
  const path = `/place/${place.id}`
  const location = [place.neighborhood, place.area].filter(Boolean).join(', ')

  return (
    <MediaReel
      to={path}
      image={place.image}
      alt={place.name}
      handle={reelHandle(place.name)}
      title={place.name}
      caption={`${location}${place.priceRange ? ` · ${priceLabel(place.priceRange)}` : ''}`}
      hashtags={reelHashtags([
        place.area,
        place.category,
        CATEGORY_SINGULAR[place.category],
        ...(place.tags || []),
        'jamaica',
      ])}
      compact={compact}
      actions={[
        {
          key: 'fav',
          label: fav ? 'Remove favorite' : 'Save favorite',
          active: fav,
          hot: true,
          icon: <Heart size={22} fill={fav ? 'currentColor' : 'none'} />,
          onClick: () => toggleFavorite(place.id),
        },
        {
          key: 'reviews',
          label: 'Reviews',
          count: formatCount(place.reviewCount),
          icon: <MessageCircle size={22} />,
          onClick: () => navigate(path),
        },
        {
          key: 'plan',
          label: inPlan ? 'Remove from plan' : 'Add to outing',
          active: inPlan,
          icon: <Plus size={22} />,
          onClick: () => togglePlan(place.id),
        },
        {
          key: 'share',
          label: 'Share place',
          icon: <Share2 size={20} />,
          onClick: () => shareReel(place.name, path),
        },
      ]}
    />
  )
}
