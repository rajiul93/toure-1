export const BLOG_FORM_OPTIONS = {
  authors: [
    { id: 'author_1', name: 'Sarah Martin' },
    { id: 'author_2', name: 'James Dupont' },
    { id: 'author_3', name: 'Amelie Laurent' },
  ],
  tags: [
    { id: 'tag_1', name: 'Louvre' },
    { id: 'tag_2', name: 'Paris Tips' },
    { id: 'tag_3', name: 'Museum Guide' },
    { id: 'tag_4', name: 'Tickets' },
    { id: 'tag_5', name: 'Family Travel' },
  ],
  categories: [
    { id: 'cat_1', name: 'Travel Guides' },
    { id: 'cat_2', name: 'Museum Tips' },
    { id: 'cat_3', name: 'Planning' },
  ],
  countries: [
    { id: 'country_fr', name: 'France' },
    { id: 'country_it', name: 'Italy' },
    { id: 'country_es', name: 'Spain' },
  ],
} as const

export const MOCK_BLOG_FOR_UPDATE = {
  basic_info: {
    blog_date: '2026-07-18',
    publish_date: '2026-07-20',
    author_id: 'author_1',
    tags: ['tag_1', 'tag_3'],
    keywords: ['louvre tickets', 'paris museum day'],
    category_id: 'cat_2',
    country_id: 'country_fr',
    title: 'First time at the Louvre? A calm route through the highlights',
    slug: 'louvre-first-time-visitor-guide',
    short_description:
      'Skip the overwhelm with a timed-entry plan, a smart wing-by-wing route, and the quiet moments worth slowing down for.',
    description:
      '<p>The Louvre rewards a plan. Start at the Pyramid with your mobile ticket ready, then follow a calm route through the highlights.</p>',
    featured_image: {
      url: 'https://images.example.com/louvre-guide.jpg',
      alt_text: 'Visitors walking toward the Louvre pyramid',
    },
    gallery: [],
    is_featured: true,
    publish_status: 'publish' as const,
    is_delete: false,
  },
  faqs: [
    {
      question: 'How early should I arrive for timed entry?',
      answer: '<p>Arrive 10–15 minutes before your slot to clear security without rushing.</p>',
    },
    {
      question: 'Can I re-enter after leaving?',
      answer: '<p>Same-day re-entry depends on your ticket type. Keep your mobile ticket visible.</p>',
    },
  ],
  meta_data: {
    meta_title: 'Louvre First-Time Visitor Guide | Day Tour Paris',
    meta_description:
      'Plan a calm Louvre visit with timed entry tips, highlight routes, and practical advice for first-time travelers.',
    meta_image: {
      url: 'https://images.example.com/louvre-meta.jpg',
      alt_text: 'Louvre pyramid at golden hour',
    },
  },
  social_meta_data: {
    fb_meta_title: 'Your calm first Louvre visit starts here',
    fb_meta_description:
      'Timed entry, smart routes, and the highlights worth slowing down for — practical Louvre advice.',
    fb_meta_image: {
      url: 'https://images.example.com/louvre-social.jpg',
      alt_text: 'Social share image for Louvre guide',
    },
  },
}
