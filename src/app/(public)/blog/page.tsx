import PageHero from '@/components/page-hero'
import { createPageMetadata } from '@/lib/metadata'
import { BLOG_POSTS } from '@/lib/blog-posts'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = createPageMetadata({
  title: 'Paris Travel Blog — Louvre Tips & Museum Guides',
  description:
    'Planning tips, Louvre routes, and ticket advice for a calm, memorable museum day in Paris.',
  path: '/blog',
})

export default function BlogPage() {
  const featured = BLOG_POSTS.find((post) => post.featured)!
  const rest = BLOG_POSTS.filter((post) => !post.featured)

  return (
    <div>
      <PageHero
        eyebrow="Travel blog"
        title="Paris museum notes for curious travelers"
        description="Practical guides on Louvre timed entry, highlight routes, and making the most of a single day in the city."
      />

      <article className="group mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-lg">
        <div className="grid lg:grid-cols-2">
          <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[320px]">
            <Image
              src={featured.image}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-heading/50 via-transparent to-transparent lg:bg-linear-to-r" />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <span className="inline-flex w-fit rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-dark">
              Featured · {featured.category}
            </span>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-heading sm:text-2xl">
              <Link href={`/blog/${featured.slug}`} className="hover:text-primary">
                {featured.title}
              </Link>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 sm:text-base">
              {featured.excerpt}
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500 sm:text-sm">
              <time dateTime={featured.date}>
                {new Date(featured.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              <span aria-hidden="true">·</span>
              <span>{featured.readTime}</span>
            </div>
            <Link
              href={`/blog/${featured.slug}`}
              className="mt-6 inline-flex w-fit items-center rounded-xl bg-heading px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-heading/90"
            >
              Read article
            </Link>
          </div>
        </div>
      </article>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <li key={post.slug}>
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.image}
                  alt=""
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-secondary-dark">
                  {post.category}
                </span>
                <h2 className="mt-2 text-base font-bold leading-snug text-heading sm:text-lg">
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">{post.excerpt}</p>
                <div className="mt-4 flex items-center justify-between gap-2 text-xs text-zinc-500">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-GB', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  )
}
