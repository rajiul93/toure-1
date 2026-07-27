import type { TourSettingsInput } from '@/lib/tour-config.types'

export function getDefaultTourSettingsInput(): TourSettingsInput {
  return {
    tour: {
      name: 'Louvre Museum Ticket + Audio Guide — Timed Entry',
      title: 'Louvre Pyramid Skip-the-Line Tickets & Audio Guide',
      description:
        'Book Louvre Pyramid timed-entry tickets with a multilingual audio guide. Instant confirmation, mobile ticket, and cancellation policy shown before payment.',
      shortDescription:
        'Skip-the-line Louvre Pyramid tickets with multilingual audio guide in Paris.',
      price: 32,
      priceCurrency: 'EUR',
      priceLabel: '€57',
      rating: 4.2,
      reviewCount: 9594,
      reviewCountLabel: '9,594',
      duration: 'PT3H',
      durationLabel: 'Approx. 2.5–3 hours',
      destination: 'Paris, France',
      meetingPoint: 'Louvre Pyramid main entrance, Rue de Rivoli, 75001 Paris, France',
      meetingPointCoords: { lat: 48.861147, lng: 2.335833 },
      ogImage: {
        url: '/images/banner/0.webp',
        alt_text: 'Louvre Pyramid entrance at golden hour',
      },
      slug: 'louvre-museum',
      href: '/',
      keywords: [
        'Louvre tickets',
        'Louvre skip the line',
        'Louvre Pyramid timed entry',
        'Paris day tour',
        'Louvre audio guide',
        'Mona Lisa ticket',
        'Louvre Museum Paris',
      ],
      brand: 'Day Tour Paris',
    },
    faqs: [
      {
        id: 'skip-the-line',
        question: 'Does this Louvre ticket skip the line?',
        answer:
          'Yes. You book a reserved timed-entry slot at the Louvre Pyramid main entrance, which lets you avoid the longest general-admission queues. Security screening still applies for all visitors.',
      },
      {
        id: 'price',
        question: 'How much does Louvre timed entry with audio guide cost?',
        answer:
          'This experience is priced from €32 per person and includes your timed-entry ticket plus a multilingual audio guide on your phone.',
      },
      {
        id: 'meeting-point',
        question: 'Where is the Louvre meeting point?',
        answer:
          'Meet at the Louvre Pyramid main entrance on Rue de Rivoli, 75001 Paris. Arrive 10–15 minutes before your entry time with your mobile ticket ready.',
      },
      {
        id: 'mona-lisa',
        question: 'Can I see the Mona Lisa with this ticket?',
        answer:
          'Yes. The self-guided audio route covers Denon Wing highlights, including the Mona Lisa, along with other major masterpieces such as the Venus de Milo and Winged Victory of Samothrace.',
      },
      {
        id: 'duration',
        question: 'How long should I plan for a Louvre visit?',
        answer:
          'Most visitors spend about 2.5 to 3 hours following the audio guide through the main wings, with time to explore additional galleries at your own pace.',
      },
      {
        id: 'mobile-ticket',
        question: 'Is the Louvre ticket mobile-friendly?',
        answer:
          'Yes. You receive instant confirmation and a mobile ticket you can show at entry. The audio guide is also designed for use on your phone.',
      },
    ],
    importantInfo: [
      {
        id: 'what-to-bring',
        title: 'What to bring',
        items: [
          'Valid photo ID matching the ticket name',
          'Fully charged phone for the mobile ticket and audio guide',
          'Comfortable walking shoes',
        ],
      },
      {
        id: 'not-allowed',
        title: 'Not allowed',
        items: [
          'Large suitcases or backpacks (lockers may be limited)',
          'Flash photography in restricted galleries',
          'Food and drinks inside exhibition rooms',
        ],
      },
      {
        id: 'know-before-you-go',
        title: 'Know before you go',
        items: [
          'Timed entry is strict — late arrivals may need to rebook.',
          'Security screening is required for all visitors.',
          'Some rooms may close temporarily for conservation work.',
          'Download the audio guide before entering if Wi-Fi is unavailable.',
        ],
      },
    ],
    bannerPhotos: [
      {
        url: '/images/banner/0.webp',
        alt_text: 'Louvre Pyramid',
        label: 'Louvre Pyramid',
      },
      {
        url: '/images/banner/1.jpeg',
        alt_text: 'Grande Galerie',
        label: 'Grande Galerie',
      },
      {
        url: '/images/banner/2.jpeg',
        alt_text: 'Denon Wing',
        label: 'Denon Wing',
      },
      {
        url: '/images/banner/3.jpeg',
        alt_text: 'Audio Guide',
        label: 'Audio Guide',
      },
      {
        url: '/images/banner/4.jpeg',
        alt_text: 'Night Entry',
        label: 'Night Entry',
      },
    ],
  }
}
