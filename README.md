# Day Tour Paris (`day_tour1`)

Marketing and booking site for Louvre Pyramid timed-entry tickets with a multilingual audio guide. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4. Checkout runs through an embedded **Bokun** widget — no custom backend yet.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # set site URL, WhatsApp, Bokun IDs
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts: `pnpm build`, `pnpm start`, `pnpm lint`.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap, Open Graph |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Support WhatsApp link (digits or `+` prefix) |
| `NEXT_PUBLIC_BOKUN_CHANNEL` | Bokun booking channel UUID |
| `NEXT_PUBLIC_BOKUN_EXPERIENCE_ID` | Bokun experience ID for the calendar widget |

Defaults for local dev are in `.env.example`.

## Pages

- `/` — Home (banner, tour details, live booking calendar)
- `/about-us` — About Day Tour Paris
- `/blog` — Travel tips; posts at `/blog/[slug]`
- `/reviews` — Traveler reviews with filters
- `/attraction-tours` — Paris museum tour listings

Footer links to `/legal/*` are configured in `src/lib/site-config.ts` but those routes are not implemented yet.

## Project layout

- `src/app/(public)/` — Public routes and home sections
- `src/components/` — Shared UI (navbar, footer, booking shell, page hero)
- `src/lib/` — Site config, tour data, Bokun readiness, blog/reviews content
- `public/images/banner/` — Hero gallery assets

Booking widget logic lives in `src/app/(public)/home/booking-form.tsx`. A single persistent sidebar instance (`PublicPageShell` → `PersistentBookingSidebar`) keeps the Bokun calendar loaded across page navigation.

## Editing content

- Brand, contact, Bokun URLs, about copy: `src/lib/site-config.ts`
- Louvre tour facts, FAQ, pricing: `src/lib/tour-schema.ts`
- Blog posts: `src/lib/blog-posts.ts`
- Reviews: `src/lib/reviews-data.ts`

## Agent / contributor notes

Cursor agents should read `.cursor/rules/project-overview.mdc` for architecture details, booking cache behavior, and conventions.
