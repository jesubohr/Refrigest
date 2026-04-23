'use client'

import { useState, useCallback } from 'react'

export interface GeoCoords {
  lat: number
  lng: number
  accuracy: number
}

export interface UseGeoResult {
  coords: GeoCoords | null
  loading: boolean
  error: string | null
  capture(): void
}

/** One-tap GPS capture hook */
export function useGeo(): UseGeoResult {
  const [coords, setCoords] = useState<GeoCoords | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const capture = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device.')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    )
  }, [])

  return { coords, loading, error, capture }
}
