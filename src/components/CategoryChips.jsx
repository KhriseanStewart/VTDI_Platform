import {
  Utensils,
  Wine,
  Coffee,
  Clapperboard,
  Gamepad2,
  Palmtree,
  Landmark,
  Sparkles,
} from 'lucide-react'
import { cn, ui } from '../lib/ui'

const CHIPS = [
  { value: 'all', label: 'For You', icon: Sparkles },
  { value: 'restaurant', label: 'Restaurants', icon: Utensils },
  { value: 'bar', label: 'Bars', icon: Wine },
  { value: 'cafe', label: 'Cafes', icon: Coffee },
  { value: 'movies', label: 'Movies', icon: Clapperboard },
  { value: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { value: 'beach', label: 'Beaches', icon: Palmtree },
  { value: 'attraction', label: 'Attractions', icon: Landmark },
]

export default function CategoryChips({ selected, onSelect }) {
  return (
    <div className={ui.chips}>
      {CHIPS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          className={cn(ui.chip, selected === value && ui.chipActive)}
          onClick={() => onSelect(value)}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </div>
  )
}
