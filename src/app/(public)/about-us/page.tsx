import AboutValueIcon from '@/components/about-value-icon'
import PageHero from '@/components/page-hero'
import { createSeoPageMetadata } from '@/lib/metadata'
import { getSiteConfigFromDB } from '@/lib/services/site-settings.service'
import { getTourConfigFromDB } from '@/lib/services/tour-settings.service'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return createSeoPageMetadata('about')
}

export default async function AboutUsPage() {
  const [site, { louvreTour }] = await Promise.all([
    getSiteConfigFromDB(),
    getTourConfigFromDB(),
  ])

  return (
    <div>
      <PageHero
        eyebrow="About us"
        title={`Welcome to ${louvreTour.brand}`}
        description={site.about.heroDescription}
      />

      <div className="mt-8 space-y-8">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-heading">What we do</h2>
          {site.about.whatWeDo.map((paragraph) => (
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
            {site.about.values.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <AboutValueIcon icon={item.icon} />
                <h3 className="mt-4 font-semibold text-heading">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-linear-to-br from-primary-soft via-white to-success-soft p-6 ring-1 ring-zinc-200 sm:p-8">
          <h2 className="text-lg font-bold text-heading">Based in Paris, built for travelers</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-700 sm:text-base">
            {site.about.closing}
          </p>
        </section>
      </div>
    </div>
  )
}
