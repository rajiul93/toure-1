'use client'

import type { ItineraryStop } from '@/lib/itinerary-stops'
import { useEffect, useRef } from 'react'

export type { ItineraryStop } from '@/lib/itinerary-stops'

type LeafletModule = typeof import('leaflet')

function createMarkerIcon(L: LeafletModule, stop: ItineraryStop, active: boolean) {
  const activeRing = active ? 'outline:3px solid #ff3737;outline-offset:2px;' : ''

  if (stop.kind === 'meeting' || stop.kind === 'end') {
    const label = stop.kind === 'end' ? '🏁' : ''
    return L.divIcon({
      className: 'meeting-map-pin',
      html: `<div style="position:relative;width:34px;height:34px;">
        <div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:#16a34a;border:3px solid white;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,.22);${activeRing}"></div>
        ${label ? `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;transform:translateY(-2px);">${label}</span>` : ''}
      </div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -30],
    })
  }

  return L.divIcon({
    className: 'meeting-map-pin',
    html: `<div style="width:32px;height:32px;border-radius:9999px;background:#18181b;color:white;display:flex;align-items:center;justify-content:center;font:700 14px/1 system-ui,sans-serif;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.22);${active ? 'transform:scale(1.12);' : ''}${activeRing}">${stop.number}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  })
}

export default function MeetingPointMap({
  stops,
  activeId,
}: {
  stops: ItineraryStop[]
  activeId: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const leafletRef = useRef<LeafletModule | null>(null)
  const markersRef = useRef<Map<string, import('leaflet').Marker>>(new Map())

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let cancelled = false

    ;(async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (cancelled || !containerRef.current) return

      leafletRef.current = L

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const latlngs = stops.map((stop) => [stop.lat, stop.lng] as [number, number])

      L.polyline(latlngs, {
        color: '#52525b',
        weight: 3,
        dashArray: '7 9',
        opacity: 0.75,
      }).addTo(map)

      stops.forEach((stop) => {
        const marker = L.marker([stop.lat, stop.lng], {
          icon: createMarkerIcon(L, stop, stop.id === activeId),
        }).addTo(map)

        marker.bindPopup(
          `<strong>${stop.title}</strong><br><span style="font-size:13px;color:#52525b">${stop.subtitle}</span>`,
        )
        markersRef.current.set(stop.id, marker)
      })

      map.fitBounds(L.latLngBounds(latlngs), { padding: [36, 36] })
      mapRef.current = map

      const activeStop = stops.find((stop) => stop.id === activeId)
      if (activeStop) {
        map.panTo([activeStop.lat, activeStop.lng], { animate: false })
        markersRef.current.get(activeId)?.openPopup()
      }
    })()

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      leafletRef.current = null
      markersRef.current.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init map once
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const L = leafletRef.current
    if (!map || !L) return

    stops.forEach((stop) => {
      const marker = markersRef.current.get(stop.id)
      if (!marker) return

      const isActive = stop.id === activeId
      marker.setIcon(createMarkerIcon(L, stop, isActive))

      if (isActive) {
        map.panTo([stop.lat, stop.lng], { animate: true })
        marker.openPopup()
      } else {
        marker.closePopup()
      }
    })
  }, [activeId, stops])

  return (
    <div
      ref={containerRef}
      className="meeting-point-map relative isolate z-0 h-full min-h-[280px] w-full rounded-2xl sm:min-h-[360px]"
      // Not `role="img"`: that collapsed the whole Leaflet subtree into one
      // node, hiding the zoom controls, marker popups and the OSM attribution
      // link from assistive tech. `group` keeps it labelled while leaving the
      // interactive children reachable. The stop list above is the text
      // equivalent for anyone who cannot use the map.
      role="group"
      aria-label="Tour route map"
    />
  )
}
