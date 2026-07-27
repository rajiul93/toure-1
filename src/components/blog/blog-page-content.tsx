'use client'

import BlogSearchBar from '@/components/blog/blog-search-bar'
import { fetchBlogPosts } from '@/lib/blog-api'
import { SITE } from '@/lib/site-config'
import { useBlogSearchStore } from '@/store/blog-search-store'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'

export default function BlogPageContent() {
  const debouncedQuery = useBlogSearchStore((state) => state.debouncedQuery)

  const { data: posts = [], isLoading, isFetching } = useQuery({
    queryKey: ['blog-posts', debouncedQuery],
    queryFn: () => fetchBlogPosts(debouncedQuery),
  })

  const showLoading = isLoading || (isFetching && posts.length === 0)

  return (
    <div className="py-10 ">
      <header className="text-center">
        <h1 className="font-script text-4xl font-normal tracking-normal text-heading sm:text-5xl">
          Latest Blog Posts
        </h1>
      </header>

      <div className="mt-8">
        <BlogSearchBar />
      </div>

      <div className="relative mt-10">
        {showLoading ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <li key={index} className="animate-pulse">
                <div className="aspect-[16/10] rounded-lg bg-zinc-100" />
                <div className="mt-4 h-5 w-full rounded bg-zinc-100" />
                <div className="mt-2 h-4 w-24 rounded bg-zinc-100" />
              </li>
            ))}
          </ul>
        ) : posts.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-500">
            No blog posts match your search. Try another keyword.
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <article className="group">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-zinc-100">
                      <Image
                        src={post.image}
                        alt=""
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[10px] font-bold uppercase tracking-wide text-heading shadow-sm">
                        {SITE.brand.name.slice(0, 2)}
                      </span>
                    </div>
                    <h2 className="mt-4 text-sm font-bold leading-snug text-heading transition group-hover:text-primary sm:text-base">
                      {post.title}
                    </h2>
                    <time
                      dateTime={post.date}
                      className="mt-2 block text-sm text-zinc-400"
                    >
                      {post.date}
                    </time>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        )}

        {isFetching && !isLoading && posts.length > 0 ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full w-1/3 animate-pulse bg-primary/60" />
          </div>
        ) : null}
      </div>
    </div>
  )
}
