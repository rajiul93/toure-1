-- Per-tour SEO/social metadata and Bokun widget target for "AttractionTour".
--
-- Applied with `prisma db execute`, NOT `prisma db push`. This database is
-- shared with another application (User, Student, Course, Enrollment, Follow),
-- and `db push` proposes dropping those tables. See
-- 2026-07-add-attraction-tour.sql for the full note.
--
-- All columns default to '' / '{}' so existing rows stay valid and every field
-- is optional: blank SEO falls back to the tour's own title/overview/feature
-- image, and a blank Bokun channel falls back to the site-wide one used by the
-- home page.

ALTER TABLE "AttractionTour"
  ADD COLUMN IF NOT EXISTS "metaTitle"       TEXT   NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "metaDescription" TEXT   NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "metaKeywords"    TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "ogImageUrl"      TEXT   NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "ogImageAlt"      TEXT   NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "bokunChannel"        TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "bokunExperienceId"   TEXT NOT NULL DEFAULT '';
