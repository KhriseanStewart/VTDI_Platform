import { useCallback, useEffect, useRef, useState } from 'react'
import { GoogleMap, MarkerF } from '@react-google-maps/api'
import { JAMAICA_CENTER, MAP_OPTIONS } from '../../lib/maps'
import { cn, ui } from '../../lib/ui'
import { useGoogleMaps } from './GoogleMaps'

const mapStyle = { width: '100%', height: '260px', borderRadius: '12px' }

function reverseGeocode(latLng) {
  return new Promise((resolve) => {
    if (!window.google?.maps) {
      resolve('')
      return
    }
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results?.[0]) resolve(results[0].formatted_address)
      else resolve('')
    })
  })
}

/**
 * Search + map picker. Never shows lat/lng — fills { lat, lng, address } via onChange.
 */
export default function PlaceLocationPicker({ value, onChange }) {
  const { enabled, isLoaded, loadError } = useGoogleMaps()
  const inputRef = useRef(null)
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)

  const lat = value?.lat
  const lng = value?.lng
  const address = value?.address || ''
  const hasPin = Number.isFinite(lat) && Number.isFinite(lng)

  const emit = useCallback(
    (next) => {
      onChange?.(next)
    },
    [onChange],
  )

  const setFromLatLng = useCallback(
    async (coords, knownAddress) => {
      const nextAddress = knownAddress ?? (await reverseGeocode(coords))
      emit({
        lat: coords.lat,
        lng: coords.lng,
        address: nextAddress || '',
      })
    },
    [emit],
  )

  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google?.maps?.places) return undefined

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry', 'name'],
      componentRestrictions: { country: 'jm' },
    })

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      const loc = place?.geometry?.location
      if (!loc) return
      const coords = { lat: loc.lat(), lng: loc.lng() }
      setFromLatLng(coords, place.formatted_address || place.name || '')
      const m = mapRef.current
      m?.panTo(coords)
      m?.setZoom(15)
    })

    return () => {
      if (listener) listener.remove()
    }
  }, [isLoaded, setFromLatLng])

  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = address
    }
  }, [address])

  useEffect(() => {
    if (map && hasPin) {
      map.panTo({ lat, lng })
    }
  }, [map, hasPin, lat, lng])

  const onLoad = useCallback((m) => {
    mapRef.current = m
    setMap(m)
  }, [])
  const onUnmount = useCallback(() => {
    mapRef.current = null
    setMap(null)
  }, [])

  if (!enabled) {
    return (
      <div className={cn(ui.mapFallback, ui.placePickerFallback)}>
        <p>
          Add a Google Maps API key to <code>.env</code> to pick a location.
        </p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className={cn(ui.mapFallback, ui.placePickerFallback)}>
        <p>Couldn’t load Google Maps. Check your API key and Places API.</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={cn(ui.mapFallback, ui.placePickerFallback)}>
        <p>Loading map…</p>
      </div>
    )
  }

  return (
    <div className={ui.placePicker}>
      <label className={ui.field}>
        <span className={ui.fieldLabel}>Location on Google Maps</span>
        <input
          ref={inputRef}
          type="text"
          className={ui.fieldControl}
          placeholder="Search a place in Jamaica…"
          defaultValue={address}
          autoComplete="off"
        />
      </label>
      <p className={cn(ui.muted, ui.placePickerHint)}>
        Search or tap the map to set the pin. Address is filled automatically.
      </p>
      <GoogleMap
        mapContainerStyle={mapStyle}
        center={hasPin ? { lat, lng } : JAMAICA_CENTER}
        zoom={hasPin ? 15 : 9}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={(e) => {
          const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() }
          setFromLatLng(coords)
        }}
        options={{
          ...MAP_OPTIONS,
          clickableIcons: true,
        }}
      >
        {hasPin && (
          <MarkerF
            position={{ lat, lng }}
            draggable
            onDragEnd={(e) => {
              const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() }
              setFromLatLng(coords)
            }}
          />
        )}
      </GoogleMap>
      {address ? (
        <p className={cn(ui.muted, ui.placePickerAddress)}>Selected: {address}</p>
      ) : (
        <p className={cn(ui.muted, ui.placePickerAddress)}>No location selected yet.</p>
      )}
    </div>
  )
}
