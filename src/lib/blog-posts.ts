export const BLOG_POSTS = [
  {
    slug: 'louvre-first-time-visitor-guide',
    title: 'First time at the Louvre? A calm route through the highlights',
    excerpt:
      'Skip the overwhelm with a timed-entry plan, a smart wing-by-wing route, and the quiet moments worth slowing down for.',
    category: 'Louvre Tips',
    date: '2026-07-18',
    readTime: '7 min read',
    image: '/images/banner/0.webp',
    featured: true,
  },
  {
    slug: 'mona-lisa-without-the-crowd',
    title: 'How to see the Mona Lisa without losing half your day',
    excerpt:
      'Timing, entrance strategy, and where to stand once you are in the room — practical advice from repeat visitors.',
    category: 'Planning',
    date: '2026-07-10',
    readTime: '5 min read',
    image: '/images/banner/1.jpeg',
    featured: false,
  },
  {
    slug: 'best-time-louvre-pyramid-entry',
    title: 'Best times to book Louvre Pyramid entry in Paris',
    excerpt:
      'Morning vs afternoon slots, weekday patterns, and when timed entry feels the most relaxed.',
    category: 'Tickets',
    date: '2026-06-28',
    readTime: '4 min read',
    image: '/images/banner/2.jpeg',
    featured: false,
  },
  {
    slug: 'audio-guide-vs-guided-tour',
    title: 'Audio guide or guided tour: what fits a short Paris stop',
    excerpt:
      'Compare flexibility, pace, and cost when you only have one museum day in the city.',
    category: 'Experience',
    date: '2026-06-14',
    readTime: '6 min read',
    image: '/images/banner/3.jpeg',
    featured: false,
  },
] as const

export type BlogPost = (typeof BLOG_POSTS)[number]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

export const BLOG_POST_BODY: Record<string, string[]> = {
  'louvre-first-time-visitor-guide': [
    'The Louvre rewards a plan. With more than 35,000 works on display, first-time visitors often try to see everything — and leave exhausted. A better approach: pick one timed-entry slot, one clear route, and three anchor masterpieces.',
    'Start at the Pyramid with your mobile ticket ready. Security is mandatory for everyone, but a reserved slot keeps you out of the longest general queues. Once inside, head to Denon first if the Mona Lisa is your priority; otherwise begin with whichever wing matches your interests and let the audio guide set the pace.',
    'Build in pauses. The museum is not a race. The best visits include one slow room, one photo stop, and one unplanned detour. That combination is what turns a checklist visit into a memory.',
  ],
  'mona-lisa-without-the-crowd': [
    'The Mona Lisa room is famous for a reason — and for the crowd around it. Your timed-entry slot matters, but so does your route. Arriving early in your window and moving directly to Denon gives you the best chance of a clearer view.',
    'Expect a brief wait even on good days. The painting is smaller than most visitors expect, but the experience improves when you know where to stand and how long to stay. Two or three minutes of focused viewing beats twenty minutes of jostling.',
  ],
  'best-time-louvre-pyramid-entry': [
    'Weekday mornings are usually the calmest for timed entry, especially outside French school holiday peaks. Late afternoon can work well if you prefer fewer families and softer light in the courtyards.',
    'Book as soon as your travel dates are fixed. Popular slots disappear quickly in spring and summer, and the best experience is often the one you reserve early — not the one you chase at the door.',
  ],
  'audio-guide-vs-guided-tour': [
    'An audio guide wins on flexibility. You choose the pace, pause for coffee, and linger where you care most. A live guide wins on context and conversation — ideal if you want stories, not just facts.',
    'For a single museum day in Paris, many travelers prefer timed entry plus audio: lower cost, full control, and enough structure to avoid decision fatigue in the world\'s largest museum.',
  ],
}
