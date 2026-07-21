import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  DirectionsRenderer,
} from '@react-google-maps/api'
import { CATEGORY_COLOR } from '../../data/outyahData'
import {
  GOOGLE_MAPS_API_KEY,
  JAMAICA_CENTER,
  MAP_OPTIONS,
  hasMapsKey,
  categoryMarkerIcon,
} from '../../lib/maps'

const containerStyle = { width: '100%', height: '100%' }

function MapsMissing() {
  return (
    <div className="map-fallback">
      <p>Add a Google Maps API key to <code>.env</code> to enable the map.</p>
    </div>
  )
}

function MapsLoading() {
  return (
    <div className="map-fallback">
      <p>Loading map…</p>
    </div>
  )
}

function useGoogleMaps() {
  const enabled = hasMapsKey()
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'outyah-google-maps',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
  })
  return { enabled, isLoaded: enabled && isLoaded, loadError }
}

function pinIcon(place, { selected = false, label = '' } = {}) {
  return categoryMarkerIcon(
    place.category,
    CATEGORY_COLOR[place.category],
    { selected, label },
  )
}

/** Explore: pins for many places, click to select */
export function PlacesMap({ places, selectedId, onSelect }) {
  const { enabled, isLoaded, loadError } = useGoogleMaps()
  const [map, setMap] = useState(null)

  const onLoad = useCallback((m) => setMap(m), [])
  const onUnmount = useCallback(() => setMap(null), [])

  useEffect(() => {
    if (!map || !window.google || !places.length) return
    const bounds = new window.google.maps.LatLngBounds()
    places.forEach((p) => bounds.extend(p.map))
    map.fitBounds(bounds, 48)
    if (places.length === 1) map.setZoom(14)
  }, [map, places])

  if (!enabled) return <MapsMissing />
  if (loadError) {
    return (
      <div className="map-fallback">
        <p>Couldn’t load Google Maps. Check your API key and billing.</p>
      </div>
    )
  }
  if (!isLoaded) return <MapsLoading />

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={JAMAICA_CENTER}
      zoom={9}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={MAP_OPTIONS}
    >
      {places.map((p) => {
        const selected = selectedId === p.id
        return (
          <MarkerF
            key={p.id}
            position={p.map}
            title={`${p.name} · ${p.category}`}
            icon={pinIcon(p, { selected })}
            onClick={() => onSelect?.(p.id)}
            opacity={!selectedId || selected ? 1 : 0.55}
            zIndex={selected ? 10 : 1}
          />
        )
      })}
    </GoogleMap>
  )
}

/** Venue detail: single pin */
export function PlaceMap({ place }) {
  const { enabled, isLoaded, loadError } = useGoogleMaps()

  if (!place?.map) return null
  if (!enabled) return <MapsMissing />
  if (loadError) {
    return (
      <div className="map-fallback">
        <p>Couldn’t load Google Maps.</p>
      </div>
    )
  }
  if (!isLoaded) return <MapsLoading />

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={place.map}
      zoom={15}
      options={MAP_OPTIONS}
    >
      <MarkerF
        position={place.map}
        title={place.name}
        icon={pinIcon(place, { selected: true })}
      />
    </GoogleMap>
  )
}

/** Planner: ordered route between stops */
export function RouteMap({ stops }) {
  const { enabled, isLoaded, loadError } = useGoogleMaps()
  const [directions, setDirections] = useState(null)

  const pathKey = useMemo(
    () => stops.map((s) => s.id).join('→'),
    [stops],
  )

  useEffect(() => {
    if (!isLoaded || !window.google || stops.length < 2) {
      setDirections(null)
      return
    }

    const service = new window.google.maps.DirectionsService()
    service.route(
      {
        origin: stops[0].map,
        destination: stops.at(-1).map,
        waypoints: stops.slice(1, -1).map((s) => ({
          location: s.map,
          stopover: true,
        })),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') setDirections(result)
        else setDirections(null)
      },
    )
  }, [isLoaded, pathKey, stops])

  if (!enabled) return <MapsMissing />
  if (loadError) {
    return (
      <div className="map-fallback">
        <p>Couldn’t load Google Maps.</p>
      </div>
    )
  }
  if (!isLoaded) return <MapsLoading />

  if (stops.length === 0) {
    return (
      <div className="map-fallback">
        <p>Add stops to see your route on the map.</p>
      </div>
    )
  }

  const center = stops[0]?.map ?? JAMAICA_CENTER

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={stops.length === 1 ? 14 : 10}
      options={MAP_OPTIONS}
    >
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#1f6b4f',
              strokeWeight: 5,
              strokeOpacity: 0.9,
            },
          }}
        />
      )}
      {stops.map((s, i) => (
        <MarkerF
          key={s.id}
          position={s.map}
          title={s.name}
          icon={pinIcon(s, { label: String(i + 1), selected: true })}
          zIndex={i + 1}
        />
      ))}
    </GoogleMap>
  )
}
