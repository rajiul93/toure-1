'use client'

import { formatBlogDisplayDate } from '@/lib/dayjs'
import type { PublicRelatedBlogPost } from '@/lib/blog-detail'
import { SITE } from '@/lib/site-config'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'

type RelatedBlogsRailProps = {
  posts: PublicRelatedBlogPost[]
}

/** Ignore sub-pixel rounding when deciding whether an end has been reached. */
const SCROLL_EPSILON = 2

export default function RelatedBlogsRail({ posts }: RelatedBlogsRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const syncArrows = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > SCROLL_EPSILON)
    setCanScrollRight(el.scrollLeft < maxScroll - SCROLL_EPSILON)
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    // ResizeObserver fires once on observe, which also gives us the initial
    // state without calling setState synchronously inside this effect.
    const observer = new ResizeObserver(syncArrows)
    observer.observe(el)
    el.addEventListener('scroll', syncArrows, { passive: true })

    return () => {
      observer.disconnect()
      el.removeEventListener('scroll', syncArrows)
    }
  }, [syncArrows])

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    // Advance by one card so the rail lands on a snap point.
    const card = el.querySelector('[data-rail-card]')
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8
    el.scrollBy({
      left: step * direction,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }, [])

  if (posts.length === 0) return null

  return (
    // Boxed panel from `sm` up; on mobile it is a plain section so the rail
    // lines up with the article text instead of sitting inside a card.
    <section
      className="mt-10 min-w-0 sm:mt-12 sm:rounded-2xl sm:border sm:border-zinc-200 sm:bg-zinc-50 sm:p-6"
      aria-labelledby="related-blogs-heading"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="related-blogs-heading" className="text-xl font-bold text-heading sm:text-2xl">
            Related articles
          </h2>
          <p className="mt-1 text-sm text-zinc-500">More stories you may like</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/blog"
            className="hidden text-sm font-semibold text-primary transition hover:text-primary-hover sm:inline-flex"
          >
            View all
          </Link>
          {/* Pointer devices have no touch-scroll affordance, so give them
              explicit controls. Hidden on mobile, where swiping is natural. */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canScrollLeft}
              aria-label="Show previous articles"
              className="flex size-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-heading shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            >
              <FaChevronLeft className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canScrollRight}
              aria-label="Show more articles"
              className="flex size-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-heading shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            >
              <FaChevronRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* No negative margins: cards stay inside the panel padding rather than
          running into its border. `tabIndex` makes the rail keyboard-scrollable. */}
      <div
        ref={scrollerRef}
        tabIndex={0}
        role="group"
        aria-label="Related articles carousel"
        className="scrollbar-none mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:mt-8 sm:gap-5"
      >
        {posts.map((post) => (
          <article
            key={post.slug}
            data-rail-card
            className="w-70 shrink-0 snap-start sm:w-76"
          >
            <Link href={`/blog/${post.slug}`} className="group block">
              <div className="relative aspect-16/10 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/80">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 280px, 304px"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-heading shadow-sm">
                  {post.categoryLabel}
                </span>
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[10px] font-bold uppercase tracking-wide text-heading shadow-sm">
                  {SITE.brand.name.slice(0, 2)}
                </span>
              </div>
              <h3 className="mt-4 line-clamp-2 text-sm font-bold leading-snug text-heading transition group-hover:text-primary sm:text-base">
                {post.title}
              </h3>
              <time dateTime={post.date} className="mt-2 block text-sm text-zinc-400">
                {formatBlogDisplayDate(post.date)}
              </time>
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link
          href="/blog"
          className="inline-flex text-sm font-semibold text-primary transition hover:text-primary-hover"
        >
          View all articles
        </Link>
      </div>
    </section>
  )
}
