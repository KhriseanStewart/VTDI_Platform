export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export const JAMAICA_CENTER = { lat: 18.15, lng: -77.3 }

export const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
}

/** Simple glyphs drawn inside category map pins */
const CATEGORY_GLYPH = {
  restaurant: 'M12 5c-1.2 0-2.2.9-2.2 2.1 0 .4.1.8.4 1.1L8 17h2.2l.6-3h2.4l.6 3H16l-2.2-8.8c.3-.3.4-.7.4-1.1C14.2 5.9 13.2 5 12 5zm-1 6 .4-2h1.2l.4 2h-2z',
  bar: 'M7 4h10l-1.5 6H8.5L7 4zm2.2 8h5.6v1.2c0 1.7-1.3 3-2.8 3s-2.8-1.3-2.8-3V12zM11 17h2v3h-2v-3z',
  cafe: 'M6 8h10a3 3 0 0 1 0 6h-1v1.5A2.5 2.5 0 0 1 12.5 18h-3A2.5 2.5 0 0 1 7 15.5V14H6a4 4 0 0 1 0-8zm10 2a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2h-1z',
  movies: 'M4 7h16v10H4V7zm2 2v6h12V9H6zm1.5 1.5h2v3h-2v-3zm4 0h2v3h-2v-3zm4 0h2v3h-2v-3z',
  gaming: 'M5 10c0-1.7 1.3-3 3-3h8c1.7 0 3 1.3 3 3v4c0 1.7-1.3 3-3 3H8c-1.7 0-3-1.3-3-3v-4zm3.2 1.2v1.6H6.8v-1.6h1.4zm8.2.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zm-2.4 1.6a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z',
  attraction: 'M12 3l2.1 4.3 4.7.7-3.4 3.3.8 4.7L12 14.8 7.8 16l.8-4.7-3.4-3.3 4.7-.7L12 3z',
  beach: 'M4 17c2.5-1.5 5-2.2 8-2.2S17.5 15.5 20 17v2H4v-2zm8-3c-2.2 0-4-2.2-4-5 0-1.5.7-2.8 1.7-3.5C9.2 6.2 8 7.8 8 9.8c0 2.9 1.8 5.2 4 5.2z',
}

const FALLBACK_COLOR = '#1f6b4f'

const iconCache = new Map()

export function hasMapsKey() {
  return Boolean(GOOGLE_MAPS_API_KEY)
}

/**
 * Category-colored map pin. Optional label (e.g. stop number) replaces the glyph.
 */
export function categoryMarkerIcon(category, color, { selected = false, label = '' } = {}) {
  const fill = color || FALLBACK_COLOR
  const scale = selected ? 1.15 : 1
  const w = Math.round(36 * scale)
  const h = Math.round(48 * scale)
  const cacheKey = `${category}|${fill}|${selected}|${label}`

  if (iconCache.has(cacheKey)) return iconCache.get(cacheKey)

  const glyph = CATEGORY_GLYPH[category] || CATEGORY_GLYPH.attraction
  const inner = label
    ? `<text x="18" y="20" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="13" font-weight="700">${label}</text>`
    : `<g transform="translate(6 4) scale(0.75)" fill="#fff"><path d="${glyph}"/></g>`

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 36 48">
      <path fill="${fill}" stroke="#fff" stroke-width="2"
        d="M18 1C9.7 1 3 7.7 3 16c0 11.2 13.2 29.4 14 30.4a1.2 1.2 0 0 0 2 0C20 45.4 33 27.2 33 16 33 7.7 26.3 1 18 1z"/>
      <circle cx="18" cy="16" r="9" fill="${fill}" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>
      ${inner}
    </svg>
  `.trim()

  const icon = {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize:
      typeof window !== 'undefined' && window.google?.maps
        ? new window.google.maps.Size(w, h)
        : { width: w, height: h },
    anchor:
      typeof window !== 'undefined' && window.google?.maps
        ? new window.google.maps.Point(w / 2, h)
        : { x: w / 2, y: h },
  }

  iconCache.set(cacheKey, icon)
  return icon
}

export function directionsUrl(stops) {
  if (!stops?.length) return 'https://maps.google.com'
  if (stops.length === 1) {
    const { lat, lng } = stops[0].map
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  }
  const origin = `${stops[0].map.lat},${stops[0].map.lng}`
  const destination = `${stops.at(-1).map.lat},${stops.at(-1).map.lng}`
  const waypoints = stops
    .slice(1, -1)
    .map((s) => `${s.map.lat},${s.map.lng}`)
    .join('|')
  const wp = waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ''
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${wp}&travelmode=driving`
}
