import type { ReactNode } from 'react'

type InclusionItem = {
  lead: string
  rest?: string
}

const WHAT_YOU_GET: InclusionItem[] = [
  {
    lead: 'Louvre Museum timed-entry ticket',
    rest: 'for your selected visit time',
  },
  {
    lead: 'Audio guide option',
    rest: 'for the museum highlights, where selected at checkout',
  },
  {
    lead: 'Self-guided visit',
    rest: '— explore the permanent collections at your own pace',
  },
  {
    lead: 'Mobile ticket and booking confirmation',
    rest: 'sent after checkout',
  },
  {
    lead: 'Practical entry notes, arrival advice and WhatsApp support',
    rest: 'before your visit',
  },
  {
    lead: 'Secure booking flow',
    rest: 'through the live Bókun availability calendar',
  },
]

const INCLUDED: InclusionItem[] = [
  { lead: 'Timed-entry Louvre Museum ticket' },
  { lead: 'Audio guide support', rest: 'if this option is selected' },
  { lead: 'Mobile ticket / voucher instructions' },
  { lead: 'Pre-visit entry guidance' },
  { lead: 'WhatsApp support', rest: 'for booking questions' },
]

const NOT_INCLUDED: InclusionItem[] = [
  { lead: 'Live guided tour', rest: 'inside the museum' },
  { lead: 'Hotel pickup or private transport' },
  { lead: 'Food, drinks or personal expenses' },
  { lead: 'Headphones', rest: 'for digital audio guide' },
  { lead: 'Temporary exhibitions', rest: 'unless clearly listed' },
]

function CheckMark() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 size-[18px] shrink-0 text-emerald-600" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function XMark() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 size-[18px] shrink-0 text-rose-500" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ItemList({
  items,
  variant,
}: {
  items: InclusionItem[]
  variant: 'check' | 'x'
}) {
  const Mark = variant === 'check' ? CheckMark : XMark

  return (
    <ul className="space-y-3.5">
      {items.map((item) => (
        <li key={item.lead} className="flex gap-3">
          <Mark />
          <p className="min-w-0 text-[15px] leading-[1.55] text-zinc-600">
            <span className="font-semibold text-heading">{item.lead}</span>
            {item.rest ? <> {item.rest}</> : null}
          </p>
        </li>
      ))}
    </ul>
  )
}

function Block({
  title,
  children,
  titleClassName = 'text-base font-bold text-heading sm:text-[17px]',
}: {
  title: string
  children: ReactNode
  titleClassName?: string
}) {
  return (
    <div>
      <h3 className={titleClassName}>{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export default function TourInclusions() {
  return (
    <section
      id="inclusions"
      className="scroll-mt-28 border-t border-zinc-200 py-7 sm:py-8"
      aria-labelledby="tour-inclusions-heading"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <div className="min-w-0 flex-1 lg:max-w-[42%]">
          <Block title="What you get">
            <ItemList items={WHAT_YOU_GET} variant="check" />
          </Block>
        </div>

        <div className="min-w-0 flex-1 lg:max-w-[58%]">
          <h2
            id="tour-inclusions-heading"
            className="text-base font-bold text-heading sm:text-[17px]"
          >
            Included / not included
          </h2>

          <div className="mt-4 grid gap-8 sm:grid-cols-2 sm:gap-x-8">
            <Block title="Included" titleClassName="text-sm font-bold text-heading sm:text-[15px]">
              <ItemList items={INCLUDED} variant="check" />
            </Block>
            <Block title="Not included" titleClassName="text-sm font-bold text-heading sm:text-[15px]">
              <ItemList items={NOT_INCLUDED} variant="x" />
            </Block>
          </div>
        </div>
      </div>
    </section>
  )
}
