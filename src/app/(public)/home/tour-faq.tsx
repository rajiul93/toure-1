import { TOUR_FAQ } from '@/lib/tour-schema'

export default function TourFaq() {
  return (
    <section
      id="faq"
      className="scroll-mt-28 border-t border-zinc-200 py-8 lg:py-10"
      aria-labelledby="faq-heading"
    >
      <h2 id="faq-heading" className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
        Frequently asked questions
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
        Quick answers about Louvre timed entry, pricing, meeting point, and what is included.
      </p>

      <dl className="mt-5 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
        {TOUR_FAQ.map((item) => (
          <div key={item.id} className="px-4 py-4 sm:px-5">
            <dt className="text-sm font-semibold text-zinc-900 sm:text-base">{item.question}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-zinc-700">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
