import { formatRelativeTime } from '@/lib/dayjs'
import {
  getAdminBlogOverviewFromDB,
  type AdminBlogOverviewItem,
} from '@/lib/services/blog.service'
import Link from 'next/link'
import { FaPlus } from 'react-icons/fa6'

// Counts must reflect the moment the page is opened, not build time.
export const dynamic = 'force-dynamic'

function StatCard({
  label,
  value,
  href,
  tone,
}: {
  label: string
  value: number
  href: string
  tone: 'published' | 'draft' | 'deleted'
}) {
  const toneClass = {
    published: 'text-emerald-700',
    draft: 'text-amber-700',
    deleted: 'text-zinc-400',
  }[tone]

  return (
    <Link
      href={href}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold tabular-nums ${toneClass}`}>{value}</p>
    </Link>
  )
}

function StatusPill({ status }: { status: AdminBlogOverviewItem['publishStatus'] }) {
  const published = status === 'publish'
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

export default async function AdminDashboardPage() {
  const overview = await getAdminBlogOverviewFromDB()

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-heading">Blogs</h2>
          <p className="mt-1 text-sm text-zinc-600">
            What is live on the public site right now.
          </p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
        >
          <FaPlus className="size-3.5" aria-hidden="true" />
          New blog
        </Link>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Published"
          value={overview.published}
          href="/admin/blogs"
          tone="published"
        />
        <StatCard label="Draft" value={overview.draft} href="/admin/blogs" tone="draft" />
        <StatCard
          label="Deleted"
          value={overview.deleted}
          href="/admin/blogs"
          tone="deleted"
        />
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
          <h3 className="text-base font-bold text-heading">Recently edited</h3>
          <Link
            href="/admin/blogs"
            className="text-sm font-semibold text-primary transition hover:text-primary-hover"
          >
            View all
          </Link>
        </div>

        {overview.recent.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-zinc-500 sm:px-6">
            No blogs yet — create your first one.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {overview.recent.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/admin/blogs/${post.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-zinc-50 sm:px-6"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-heading">
                    {post.title}
                  </span>
                  <StatusPill status={post.publishStatus} />
                  <time
                    dateTime={post.updatedAt}
                    className="hidden shrink-0 text-xs text-zinc-400 sm:block"
                  >
                    {formatRelativeTime(post.updatedAt)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
