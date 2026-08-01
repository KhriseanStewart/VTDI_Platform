import { Search } from 'lucide-react'
import { ui } from '../lib/ui'

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search places, vibes, or areas…',
}) {
  return (
    <label className={ui.searchBar}>
      <Search size={18} />
      <input
        type="search"
        className={ui.searchInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}
