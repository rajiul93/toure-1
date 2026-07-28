import BookNowLink from '@/components/book-now-link'
import BlogArticleStructuredData from '@/components/blog/blog-article-structured-data'
import { formatBlogDisplayDate } from '@/lib/dayjs'
import { prepareBlogArticleHtml } from '@/lib/blog-article-html'
import type { PublicBlogDetail } from '@/lib/blog-detail'
import Image from 'next/image'
import Link from 'next/link'

function BlogFaqSection({ faqs }: { faqs: PublicBlogDetail['faqs'] }) {
  if (faqs.length === 0) return null

  return (
    <section className="mt-10 border-t border-zinc-200 pt-8" aria-labelledby="blog-faq-heading">
      <h2 id="blog-faq-heading" className="text-lg font-bold text-heading">
        Frequently asked questions
      </h2>
      <div className="mt-5 space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-2xl border border-zinc-200 bg-zinc-50/70 px-5 py-4"
          >
            <summary className="cursor-pointer list-none text-sm font-semibold text-heading marker:content-none [&::-webkit-details-marker]:hidden">
              {faq.question}
            </summary>
            <div
              className="blog-article-content mt-3 text-sm text-zinc-700"
              dangerouslySetInnerHTML={{ __html: prepareBlogArticleHtml(faq.answer) }}
            />
          </details>
        ))}
      </div>
    </section>
  )
}

export default function BlogArticleView({ blog }: { blog: PublicBlogDetail }) {
  return (
    <>
      <BlogArticleStructuredData blog={blog} />

      <article className="min-w-0">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm font-medium text-zinc-600 transition hover:text-primary"
        >
          ← Back to blog
        </Link>

        {/* Desktop: card. Mobile: flat article — hero full-bleed, no border/shadow inset. */}
        <div className="mt-4 sm:mt-6 sm:overflow-hidden sm:rounded-2xl sm:border sm:border-zinc-200 sm:bg-white sm:shadow-sm">
          <div className="relative aspect-[16/10] max-h-64 w-[calc(100%+2rem)] -mx-4 overflow-hidden sm:mx-0 sm:aspect-[21/9] sm:max-h-80 sm:w-full">
            <Image
              src={blog.featuredImageUrl}
              alt={blog.featuredImageAlt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 100vw, 896px"
            />
            <div className="absolute inset-0 bg-linear-to-t from-heading/60 to-transparent" />
            <div className="absolute bottom-0 flex flex-wrap gap-2 p-4 sm:p-8">
              <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-heading">
                {blog.categoryLabel}
              </span>
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-zinc-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="py-6 sm:px-10 sm:py-10">
            <header>
              <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
                {blog.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-500 sm:mt-4">
                <time dateTime={blog.publishDate}>
                  {formatBlogDisplayDate(blog.publishDate)}
                </time>
              </div>
            </header>

            <p className="mt-5 text-base leading-relaxed text-zinc-700 sm:mt-6 sm:text-lg">
              {blog.shortDescription}
            </p>

            <div
              className="blog-article-content mt-6 min-w-0 sm:mt-8"
              dangerouslySetInnerHTML={{ __html: prepareBlogArticleHtml(blog.description) }}
            />

            <BlogFaqSection faqs={blog.faqs} />

            <div className="mt-8 rounded-2xl bg-linear-to-br from-primary-soft via-white to-success-soft p-5 ring-1 ring-zinc-200 sm:mt-10 sm:p-6">
              <h2 className="text-lg font-bold text-heading">Ready to visit the Louvre?</h2>
              <p className="mt-2 text-sm text-zinc-600">
                Book timed-entry tickets with audio guide — instant confirmation and mobile tickets.
              </p>
              <BookNowLink className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover">
                Check live availability
              </BookNowLink>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}
