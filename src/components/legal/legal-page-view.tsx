import PageHero from '@/components/page-hero'
import { dayjs, toDate } from '@/lib/dayjs'
import type { LegalPageContent, LegalPageSlug } from '@/lib/legal-pages'
import { LEGAL_PAGE_SLUGS, LEGAL_PAGES } from '@/lib/legal-pages'
import Link from 'next/link'

function formatLegalDate(isoDate: string): string {
  return dayjs(toDate(isoDate)).format('MMMM D, YYYY')
}

function LegalPageNav({ currentSlug }: { currentSlug: LegalPageSlug }) {
  return (
    <nav
      aria-label="Other legal documents"
      className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 sm:p-6"
    >
      <h2 className="text-sm font-semibold text-heading">Related policies</h2>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {LEGAL_PAGE_SLUGS.filter((slug) => slug !== currentSlug).map((slug) => {
          const page = LEGAL_PAGES[slug]
          return (
            <li key={slug}>
              <Link
                href={page.path}
                className="text-sm font-medium text-primary transition hover:text-primary-hover"
              >
                {page.title}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default function LegalPageView({
  page,
  brandName,
  whatsappUrl,
  whatsappLabel,
}: {
  page: LegalPageContent
  brandName: string
  whatsappUrl: string
  whatsappLabel: string
}) {
  return (
    <div>
      <PageHero eyebrow="Legal" title={page.title} description={page.summary} />

      <p className="mt-4 text-xs text-zinc-500">
        Last updated {formatLegalDate(page.lastUpdated)} · {brandName}
      </p>

      <div className="mt-8 space-y-6">
        {page.sections.map((section) => (
          <section
            key={section.title}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-lg font-bold text-heading">{section.title}</h2>
            <div className="mt-3 space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="text-sm leading-relaxed text-zinc-700 sm:text-base">
                  {paragraph}
                </p>
              ))}
            </div>
            {section.list ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 sm:text-base">
                {section.list.map((item) => (
                  <li key={item.slice(0, 48)}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section className="rounded-2xl bg-linear-to-br from-primary-soft via-white to-success-soft p-6 ring-1 ring-zinc-200 sm:p-8">
          <h2 className="text-lg font-bold text-heading">Need help?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-700 sm:text-base">
            Questions about this policy or an existing booking? Contact {brandName} on WhatsApp and
            include your booking reference if you have one.
          </p>
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {whatsappLabel}
            </a>
          ) : null}
        </section>

        <LegalPageNav currentSlug={page.slug} />
      </div>
    </div>
  )
}
