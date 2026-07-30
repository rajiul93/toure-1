import type { SiteSettingsInput } from '@/lib/site-config.types'

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Obviously-invalid placeholders. A real channel UUID must NEVER be committed
 * here: these values are what the site falls back to when the environment is
 * incomplete, so a real one would mean a misconfigured deploy silently takes
 * bookings — and money — into whichever Bókun account was hardcoded. That is
 * the single most dangerous thing to get wrong when this codebase changes
 * hands. Placeholders make the widget visibly fail instead.
 */
const DEV_BOKUN_CHANNEL = 'missing-bokun-channel'
const DEV_BOKUN_EXPERIENCE_ID = '0'

/**
 * Pure (takes its inputs) so it can be unit-tested without touching
 * `process.env`. Mirrors `resolveSiteUrl` in `site-config.ts`: hard-fail in
 * production, harmless placeholder in development.
 */
export function resolveBokunCredentials(
  rawChannel: string | undefined,
  rawExperienceId: string | undefined,
  nodeEnv: string | undefined,
): { channel: string; experienceId: string } {
  const channel = rawChannel?.trim()
  const experienceId = rawExperienceId?.trim()

  if (!channel || !experienceId) {
    if (nodeEnv === 'production') {
      throw new Error(
        '[site-config] NEXT_PUBLIC_BOKUN_CHANNEL and NEXT_PUBLIC_BOKUN_EXPERIENCE_ID are ' +
          'required in production. Without them the booking widget has no account to ' +
          'send reservations to. Set both in the deployment environment.',
      )
    }

    return {
      channel: channel || DEV_BOKUN_CHANNEL,
      experienceId: experienceId || DEV_BOKUN_EXPERIENCE_ID,
    }
  }

  return { channel, experienceId }
}

export function getDefaultSiteSettingsInput(): SiteSettingsInput {
  const whatsappNumber = digitsOnly(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '8800000000000',
  )
  // Read as literals so Next can inline them into client bundles.
  const { channel: bokunChannel, experienceId: bokunExperienceId } =
    resolveBokunCredentials(
      process.env.NEXT_PUBLIC_BOKUN_CHANNEL,
      process.env.NEXT_PUBLIC_BOKUN_EXPERIENCE_ID,
      process.env.NODE_ENV,
    )

  return {
    brand: {
      name: 'Day Tour',
      script: 'Paris',
      logo: {
        url: '',
        alt_text: 'Day Tour Paris logo',
      },
    },
    tagline:
      'Skip-the-line Louvre Pyramid tickets with multilingual audio guide in Paris.',
    footerDescription:
      'Instant confirmation, mobile tickets, and clear policies before you pay.',
    contact: {
      whatsappNumber,
      whatsappNavLabel: 'WhatsApp Help',
      whatsappCtaLabel: 'Ask on WhatsApp',
    },
    bokun: {
      channel: bokunChannel,
      experienceId: bokunExperienceId,
    },
    booking: {
      features: ['Instant confirmation', 'Mobile ticket', 'Policy before pay…'],
      trustBadges: [
        { label: 'Popular choice', tone: 'primary' },
        { label: 'Secure checkout', tone: 'sky' },
      ],
    },
    about: {
      metadataDescription:
        'Day Tour Paris helps travelers book timed-entry museum tickets with clear pricing, mobile tickets, and support when you need it.',
      heroDescription:
        'We make Paris museum days simpler — timed entry, mobile tickets, and practical guidance so you spend less time in line and more time with the art.',
      whatWeDo: [
        'Day Tour Paris focuses on high-demand Paris attractions, starting with the Louvre Museum. We partner with established booking channels to offer reserved timed-entry slots, mobile-friendly tickets, and audio guides designed for independent travelers.',
        'Whether it is your first visit or a return trip, our goal is the same: a calm entry, honest pricing, and the information you need before you arrive at the pyramid.',
      ],
      values: [
        {
          title: 'Clear booking',
          description:
            'Live availability, instant confirmation, and cancellation policy shown before you pay — no surprises at checkout.',
          icon: 'calendar',
        },
        {
          title: 'Self-guided freedom',
          description:
            'Reserved entry gets you inside faster; multilingual audio lets you explore highlights at your own pace.',
          icon: 'book',
        },
        {
          title: 'Human support',
          description:
            'Questions before or after booking? Reach us on WhatsApp for quick help with times, meeting points, and tickets.',
          icon: 'whatsapp',
        },
      ],
      closing:
        'We are a small team focused on museum-day experiences in Paris — practical details, verified reviews, and booking flows that work on your phone. More attractions and routes are on the way; the Louvre is where we started because it is where clarity matters most.',
    },
    legal: [
      { href: '/legal/privacy', label: 'Privacy policy' },
      { href: '/legal/terms', label: 'Terms of use' },
      { href: '/legal/cancellation', label: 'Cancellation policy' },
    ],
    footerPages: [
      { href: '/reviews', label: 'Reviews' },
      { href: '/blog', label: 'Blog' },
      { href: '/attraction-tours', label: 'Attraction Tours' },
      { href: '/about-us', label: 'About Us' },
    ],
  }
}
