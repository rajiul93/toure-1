export type LegalPageSlug = 'privacy' | 'terms' | 'cancellation'

export type LegalPageSection = {
  title: string
  paragraphs: string[]
  list?: string[]
}

export type LegalPageContent = {
  slug: LegalPageSlug
  path: `/legal/${LegalPageSlug}`
  title: string
  summary: string
  lastUpdated: string
  metaDescription: string
  sections: LegalPageSection[]
}

export const LEGAL_PAGE_SLUGS = ['privacy', 'terms', 'cancellation'] as const satisfies readonly LegalPageSlug[]

export const LEGAL_PAGES: Record<LegalPageSlug, LegalPageContent> = {
  privacy: {
    slug: 'privacy',
    path: '/legal/privacy',
    title: 'Privacy policy',
    summary:
      'How Day Tour Paris collects, uses, and protects your personal information when you browse our site or book museum tickets.',
    lastUpdated: '2026-07-27',
    metaDescription:
      'Privacy policy for Day Tour Paris — what data we collect when you book Louvre tickets, how we use it, and your rights under applicable privacy laws.',
    sections: [
      {
        title: 'Who we are',
        paragraphs: [
          'Day Tour Paris (“we”, “us”, “our”) operates this website to help travelers discover and book timed-entry museum tickets and related services in Paris.',
          'For privacy questions, contact us via the WhatsApp link shown on this site or through the contact details on your booking confirmation.',
        ],
      },
      {
        title: 'Information we collect',
        paragraphs: ['We may collect the following when you use our website or complete a booking:'],
        list: [
          'Contact details you provide (name, email address, phone number).',
          'Booking details such as visit date, party size, and selected products.',
          'Payment-related information processed by our booking and payment partners (we do not store full card numbers on our servers).',
          'Technical data such as IP address, browser type, device information, and pages visited.',
          'Communications you send us, including WhatsApp messages and support requests.',
        ],
      },
      {
        title: 'How we use your information',
        paragraphs: ['We use personal information to:'],
        list: [
          'Process and confirm your booking through our reservation partners.',
          'Send booking confirmations, tickets, and important visit information.',
          'Respond to support requests and pre-visit questions.',
          'Improve website performance, security, and user experience.',
          'Comply with legal obligations and prevent fraud or misuse.',
        ],
      },
      {
        title: 'Sharing with third parties',
        paragraphs: [
          'To fulfill your booking, we share necessary details with trusted partners such as reservation platforms (including Bokun), payment processors, and the attraction or supplier providing the service.',
          'We do not sell your personal information. Partners may only use data as needed to deliver the service you booked or as required by law.',
        ],
      },
      {
        title: 'Cookies and analytics',
        paragraphs: [
          'Our site may use cookies and similar technologies to remember preferences, keep sessions secure, and understand how visitors use the site.',
          'You can control cookies through your browser settings. Disabling certain cookies may affect booking widgets or site functionality.',
        ],
      },
      {
        title: 'Data retention and security',
        paragraphs: [
          'We retain personal information only as long as needed for bookings, support, accounting, and legal compliance.',
          'We apply reasonable technical and organizational measures to protect data. No online transmission is completely secure, so please use trusted networks when booking.',
        ],
      },
      {
        title: 'Your rights',
        paragraphs: [
          'Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal data, or to object to certain uses.',
          'To exercise these rights, contact us with enough detail to identify your booking. We may need to verify your identity before responding.',
        ],
      },
      {
        title: 'Changes to this policy',
        paragraphs: [
          'We may update this privacy policy from time to time. The “Last updated” date at the top of this page shows when it was last revised. Continued use of the site after changes means you accept the updated policy.',
        ],
      },
    ],
  },
  terms: {
    slug: 'terms',
    path: '/legal/terms',
    title: 'Terms of use',
    summary:
      'Rules for using the Day Tour Paris website and booking Louvre timed-entry tickets and related services through our platform.',
    lastUpdated: '2026-07-27',
    metaDescription:
      'Terms of use for Day Tour Paris — website usage rules, booking conditions, and limitations when purchasing Louvre museum tickets online.',
    sections: [
      {
        title: 'Acceptance of terms',
        paragraphs: [
          'By accessing daytourparis.com (or related domains we operate) and using our booking services, you agree to these Terms of use. If you do not agree, please do not use the site.',
        ],
      },
      {
        title: 'Our role',
        paragraphs: [
          'Day Tour Paris is an independent booking service. We help you reserve timed-entry tickets and related products for museums and attractions in Paris.',
          'Unless stated otherwise, we are not the museum operator. Visit rules, opening hours, security checks, and on-site policies are set by the attraction and may change without notice.',
        ],
      },
      {
        title: 'Bookings and pricing',
        paragraphs: ['When you book through our site:'],
        list: [
          'Prices, availability, and inclusions are shown before payment and may vary by date or product.',
          'You must provide accurate contact and visitor information. Incorrect details may prevent entry or invalidate a ticket.',
          'A booking is confirmed only after successful payment and receipt of a confirmation email or ticket.',
          'Displayed prices may include service or booking fees where applicable; the checkout summary is the final reference before you pay.',
        ],
      },
      {
        title: 'Tickets and entry',
        paragraphs: [
          'Mobile or printable tickets are delivered according to the instructions in your confirmation. Arrive at the meeting point or entrance shown on your ticket with valid ID if required.',
          'Missed time slots, late arrival, or failure to bring required documents may result in denied entry without refund, subject to the supplier’s rules and our Cancellation policy.',
        ],
      },
      {
        title: 'Acceptable use',
        paragraphs: ['You agree not to:'],
        list: [
          'Use the site for unlawful, fraudulent, or abusive purposes.',
          'Attempt to interfere with site security, booking systems, or other users.',
          'Scrape, copy, or republish substantial site content without permission.',
          'Resell tickets in violation of supplier terms or local regulations.',
        ],
      },
      {
        title: 'Intellectual property',
        paragraphs: [
          'Site content—including text, layout, branding, and original graphics—is owned by Day Tour Paris or used under license. Museum names and trademarks belong to their respective owners.',
        ],
      },
      {
        title: 'Disclaimer and liability',
        paragraphs: [
          'We strive for accurate descriptions and availability, but we do not guarantee uninterrupted access to the site or that all information is error-free.',
          'To the fullest extent permitted by law, Day Tour Paris is not liable for indirect losses, attraction closures, strikes, or events outside our reasonable control. Our liability for a confirmed booking is limited to the amount you paid us for that booking, except where mandatory consumer law provides otherwise.',
        ],
      },
      {
        title: 'Governing law',
        paragraphs: [
          'These terms are governed by the laws applicable to our operating entity in France, without regard to conflict-of-law rules. Mandatory consumer protections in your country of residence may still apply.',
        ],
      },
      {
        title: 'Contact',
        paragraphs: [
          'Questions about these terms? Reach us via WhatsApp or the contact options on your booking confirmation.',
        ],
      },
    ],
  },
  cancellation: {
    slug: 'cancellation',
    path: '/legal/cancellation',
    title: 'Cancellation policy',
    summary:
      'How changes, cancellations, and refunds work for Louvre timed-entry tickets and related products booked through Day Tour Paris.',
    lastUpdated: '2026-07-27',
    metaDescription:
      'Cancellation and refund policy for Day Tour Paris Louvre ticket bookings — deadlines, non-refundable cases, and how to request changes.',
    sections: [
      {
        title: 'Before you book',
        paragraphs: [
          'Cancellation terms for your specific product are shown during checkout before you pay. Please review them carefully—policies can differ by date, ticket type, and supplier rules.',
        ],
      },
      {
        title: 'Standard cancellation windows',
        paragraphs: [
          'For most Louvre timed-entry products sold on this site, the following applies unless a different policy is displayed at checkout:',
        ],
        list: [
          'Free cancellation up to 24 hours before the scheduled entry time, when offered by the supplier for your selected date.',
          'Cancellations within 24 hours of entry, no-shows, or missed time slots are generally non-refundable.',
          'Partial refunds or credits may apply if an attraction closes unexpectedly; decisions follow the supplier’s policy.',
        ],
      },
      {
        title: 'How to cancel or change a booking',
        paragraphs: ['To request a cancellation or date change:'],
        list: [
          'Use the self-service link in your confirmation email if one is provided.',
          'Contact us on WhatsApp with your booking reference, name, and requested change.',
          'Allow reasonable processing time; refunds are returned to the original payment method when approved.',
        ],
      },
      {
        title: 'Non-refundable situations',
        paragraphs: ['Refunds may be denied when:'],
        list: [
          'The cancellation deadline for your ticket type has passed.',
          'You did not arrive in time for your entry slot or lacked required ID or documents.',
          'The ticket was used, partially used, or altered.',
          'You booked a product marked non-refundable at checkout.',
        ],
      },
      {
        title: 'Attraction changes and force majeure',
        paragraphs: [
          'If the Louvre or another supplier cancels a slot, changes opening conditions, or closes due to exceptional events, we will follow the supplier’s remedy (rebooking, credit, or refund). We will help communicate options but cannot override museum or platform decisions.',
        ],
      },
      {
        title: 'Chargebacks',
        paragraphs: [
          'Please contact us before initiating a chargeback so we can resolve legitimate issues quickly. Unjustified chargebacks may delay resolution and affect future bookings.',
        ],
      },
      {
        title: 'Questions',
        paragraphs: [
          'If you are unsure whether your booking qualifies for a refund, message us on WhatsApp with your confirmation details—we will confirm the policy that applies to your order.',
        ],
      },
    ],
  },
}

export function getLegalPage(slug: string): LegalPageContent | undefined {
  if (slug in LEGAL_PAGES) {
    return LEGAL_PAGES[slug as LegalPageSlug]
  }
  return undefined
}

export function listLegalPages(): LegalPageContent[] {
  return LEGAL_PAGE_SLUGS.map((slug) => LEGAL_PAGES[slug])
}
