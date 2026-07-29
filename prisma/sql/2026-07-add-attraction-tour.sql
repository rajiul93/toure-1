-- Adds the attraction-tour tables only.
--
-- Applied with `prisma db execute` rather than `prisma db push`: this database
-- also holds tables from another application (User, Student, Course,
-- Enrollment, Follow) that are not in this schema, and `db push` would drop
-- them. Keep using targeted SQL for future changes here.

CREATE TABLE IF NOT EXISTS "AttractionTour" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "priceFrom" TEXT NOT NULL,
    "priceNote" TEXT NOT NULL DEFAULT '',
    "primaryCta" TEXT NOT NULL DEFAULT 'Check availability',
    "secondaryOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "overviewDescription" TEXT NOT NULL,
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lovedTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lovedQuotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "meetingPointAddress" TEXT NOT NULL DEFAULT '',
    "questionsDescription" TEXT NOT NULL DEFAULT '',
    "questionsCtaLabel" TEXT NOT NULL DEFAULT 'Contact us',
    "questionsCtaHref" TEXT NOT NULL DEFAULT '/about-us',
    "galleryPhotos" JSONB NOT NULL DEFAULT '[]',
    "importantInfo" JSONB NOT NULL DEFAULT '[]',
    "travelerPhotos" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttractionTour_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AttractionTourReview" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "reviewer" TEXT NOT NULL,
    "reviewDate" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AttractionTourReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AttractionTour_slug_key" ON "AttractionTour"("slug");
CREATE INDEX IF NOT EXISTS "AttractionTour_isPublished_idx" ON "AttractionTour"("isPublished");
CREATE INDEX IF NOT EXISTS "AttractionTour_isDeleted_idx" ON "AttractionTour"("isDeleted");
CREATE INDEX IF NOT EXISTS "AttractionTour_createdAt_idx" ON "AttractionTour"("createdAt");
CREATE INDEX IF NOT EXISTS "AttractionTourReview_tourId_idx" ON "AttractionTourReview"("tourId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AttractionTourReview_tourId_fkey'
  ) THEN
    ALTER TABLE "AttractionTourReview"
      ADD CONSTRAINT "AttractionTourReview_tourId_fkey"
      FOREIGN KEY ("tourId") REFERENCES "AttractionTour"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
