import PageHero from '@/components/page-hero'
import { createPageMetadata } from '@/lib/metadata'
import { SITE } from '@/lib/site-config'
import { LOUVRE_TOUR } from '@/lib/tour-schema'

export const metadata = createPageMetadata({
  title: 'About Us',
  description: SITE.about.metadataDescription,
  path: '/about-us',
})

export default function AboutUsPage() {
  return (
    <div>
      <PageHero
        eyebrow="About us"
        title={`Welcome to ${LOUVRE_TOUR.brand}`}
        description={SITE.about.heroDescription}
      />

      <div className="mt-8 space-y-8">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-heading">What we do</h2>
          {SITE.about.whatWeDo.map((paragraph) => (
            <p
              key={paragraph.slice(0, 40)}
              className="mt-3 text-sm leading-relaxed text-zinc-700 first:mt-3 sm:text-base"
            >
              {paragraph}
            </p>
          ))}
        </section>

        <section>
          <h2 className="text-lg font-bold text-heading">How we help</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {SITE.about.values.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <h3 className="font-semibold text-heading">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-linear-to-br from-primary-soft via-white to-success-soft p-6 ring-1 ring-zinc-200 sm:p-8">
          <h2 className="text-lg font-bold text-heading">Based in Paris, built for travelers</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-700 sm:text-base">
            {SITE.about.closing}
          </p>
        </section>
      </div>
    </div>
  )
}
