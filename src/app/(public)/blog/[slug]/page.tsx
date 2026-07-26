import BookNowLink from '@/components/book-now-link'
import { createPageMetadata } from '@/lib/metadata'
import { BLOG_POST_BODY, BLOG_POSTS, getBlogPost } from '@/lib/blog-posts'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return { title: 'Article not found' }

  return createPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
    image: post.image,
    imageAlt: post.title,
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const paragraphs = BLOG_POST_BODY[slug] ?? []

  return (
    <article>
      <Link
        href="/blog"
        className="inline-flex items-center text-sm font-medium text-zinc-600 transition hover:text-primary"
      >
        ← Back to blog
      </Link>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="relative aspect-[21/9] max-h-80 w-full">
          <Image
            src={post.image}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-heading/60 to-transparent" />
          <div className="absolute bottom-0 p-6 sm:p-8">
            <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-heading">
              {post.category}
            </span>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <header>
            <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
              {post.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              <span aria-hidden="true">·</span>
              <span>{post.readTime}</span>
            </div>
          </header>

          <p className="mt-6 text-base leading-relaxed text-zinc-700 sm:text-lg">{post.excerpt}</p>

          <div className="prose-spacing mt-8 space-y-5">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-zinc-700 sm:text-base">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-linear-to-br from-primary-soft via-white to-success-soft p-6 ring-1 ring-zinc-200">
            <h2 className="text-lg font-bold text-heading">Ready to visit the Louvre?</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Book timed-entry tickets with audio guide — instant confirmation and mobile tickets.
            </p>
            <BookNowLink
              className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
            >
              Check live availability
            </BookNowLink>
          </div>
        </div>
      </div>
    </article>
  )
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}
