export type StopKind = 'meeting' | 'stop' | 'end'

export type ItineraryStop = {
  id: string
  kind: StopKind
  number?: number
  title: string
  subtitle: string
  timelineArea: string
  duration: string
  description: string
  address: string
  lat: number
  lng: number
  mapsUrl: string
}

export const ITINERARY_STOPS: ItineraryStop[] = [
  {
    id: 'meeting',
    kind: 'meeting',
    title: 'Louvre Pyramid — Timed entry',
    subtitle: 'Louvre Pyramid — main entrance',
    timelineArea: 'Main entrance',
    duration: '15 min',
    description:
      'Arrive at the glass pyramid entrance and scan your mobile ticket at your reserved time slot.',
    address: 'Rue de Rivoli, 75001 Paris, France',
    lat: 48.861147,
    lng: 2.335833,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Louvre+Pyramid+Paris+France',
  },
  {
    id: 'stop-1',
    kind: 'stop',
    number: 1,
    title: 'Denon Wing highlights',
    subtitle: '45 minutes · Mona Lisa & Italian galleries',
    timelineArea: 'Italian galleries',
    duration: '45 min',
    description:
      'Follow the audio guide to the Italian galleries, including the Mona Lisa and major Renaissance works.',
    address: 'Denon Wing, 1st floor, Louvre Museum',
    lat: 48.860756,
    lng: 2.330694,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Denon+Wing+Louvre+Museum+Paris',
  },
  {
    id: 'stop-2',
    kind: 'stop',
    number: 2,
    title: 'Sully Wing & antiquities',
    subtitle: '40 minutes · Ancient Egyptian & Greek collections',
    timelineArea: 'Ancient collections',
    duration: '40 min',
    description: 'Explore ancient Egyptian, Greek, and Roman collections at your own pace.',
    address: 'Sully Wing, ground floor, Louvre Museum',
    lat: 48.861456,
    lng: 2.337056,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sully+Wing+Louvre+Museum+Paris',
  },
  {
    id: 'stop-3',
    kind: 'stop',
    number: 3,
    title: 'Richelieu Wing & free exploration',
    subtitle: '60 minutes · Sculpture & decorative arts',
    timelineArea: 'Sculpture & decorative arts',
    duration: '60+ min',
    description:
      'Continue with the audio route or wander independently through sculpture and decorative arts.',
    address: 'Richelieu Wing, ground floor, Louvre Museum',
    lat: 48.862178,
    lng: 2.336417,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Richelieu+Wing+Louvre+Museum+Paris',
  },
  {
    id: 'end',
    kind: 'end',
    title: 'End point',
    subtitle: 'Cour Napoléon exit',
    timelineArea: 'Cour Napoléon',
    duration: 'Exit',
    description: 'Finish your visit and exit through Cour Napoléon at your own pace.',
    address: 'Cour Napoléon, 75001 Paris, France',
    lat: 48.860611,
    lng: 2.334722,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Cour+Napoleon+Louvre+Paris',
  },
]

export const TIMELINE_STOPS = ITINERARY_STOPS.filter((stop) => stop.kind !== 'end')
