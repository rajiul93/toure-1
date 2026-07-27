export default function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-heading">Welcome, admin</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Manage team accounts, assign roles, and oversee Day Tour Paris operations.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Quick link
          </p>
          <h3 className="mt-2 font-semibold text-heading">User management</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Create manager and marketer accounts from the Users page.
          </p>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Public site
          </p>
          <h3 className="mt-2 font-semibold text-heading">Booking unchanged</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Louvre bookings still run through Bokun on the public website.
          </p>
        </article>
      </div>
    </div>
  )
}
