export const FILTER_TAGS = [
  { id: 'all', label: 'All' },
  { id: 'engaging', label: 'Engaging activities' },
  { id: 'sights', label: 'Amazing sights' },
  { id: 'audio', label: 'Audio guide' },
  { id: 'points', label: 'Points of interest' },
  { id: 'photos', label: 'Photo-worthy spots' },
] as const

export type FilterId = (typeof FILTER_TAGS)[number]['id']

export const REVIEWS = [
  {
    id: '1',
    author: 'Victoria_E',
    date: 'Jul 2026',
    rating: 5,
    tags: ['engaging', 'audio', 'sights'] as FilterId[],
    text: 'The audio guide was excellent — clear directions and just enough context at each stop. Timed entry made arrival stress-free, and we covered the Mona Lisa and Italian galleries without feeling rushed.',
  },
  {
    id: '2',
    author: 'Jennifer_D',
    date: 'Jun 2026',
    rating: 5,
    tags: ['sights', 'points'] as FilterId[],
    text: 'A great way to see Louvre highlights on your own schedule. We walked straight in at our slot, followed the audio route, and still had time to revisit rooms we loved. Perfect for first-time visitors.',
  },
  {
    id: '3',
    author: 'Marco_R',
    date: 'May 2026',
    rating: 5,
    tags: ['photos', 'sights'] as FilterId[],
    text: 'Stunning museum and the timed entry made the whole experience smooth. We skipped the long lines and had plenty of time to appreciate the masterpieces. The audio guide was easy to use on my phone.',
  },
  {
    id: '4',
    author: 'Sophie_L',
    date: 'Apr 2026',
    rating: 5,
    tags: ['engaging', 'audio'] as FilterId[],
    text: 'The self-guided route worked brilliantly. Engaging commentary throughout Denon and Sully, and we could pause whenever we wanted. Mobile ticket on the phone — no printing hassle.',
  },
  {
    id: '5',
    author: 'James_K',
    date: 'Mar 2026',
    rating: 4,
    tags: ['sights', 'photos'] as FilterId[],
    text: 'Timed entry worked perfectly — we walked straight to the pyramid entrance at our slot. The audio guide was clear and easy to follow. Would have loved one extra hour, but we still covered all the main highlights comfortably.',
  },
  {
    id: '6',
    author: 'Amélie_T',
    date: 'Feb 2026',
    rating: 5,
    tags: ['engaging', 'points'] as FilterId[],
    text: 'As a Paris local bringing friends, this was the smoothest Louvre visit we have had. Mobile ticket, no printing stress, and the route suggestions in the audio guide saved us from wandering aimlessly.',
  },
] as const

export type Review = (typeof REVIEWS)[number]

export const RATING_BREAKDOWN = [
  { stars: 5, percent: 72 },
  { stars: 4, percent: 18 },
  { stars: 3, percent: 6 },
  { stars: 2, percent: 3 },
  { stars: 1, percent: 1 },
] as const
