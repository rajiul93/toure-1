-- Adds Blog + BlogFaq tables without touching existing tables.

CREATE TABLE IF NOT EXISTS "Blog" (
    "id" TEXT NOT NULL,
    "blogDate" DATE NOT NULL,
    "publishDate" DATE NOT NULL,
    "authorId" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "categoryId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "featuredImageUrl" TEXT NOT NULL DEFAULT '',
    "featuredImageAlt" TEXT NOT NULL DEFAULT '',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "metaTitle" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "metaImageUrl" TEXT NOT NULL DEFAULT '',
    "metaImageAlt" TEXT NOT NULL DEFAULT '',
    "fbMetaTitle" TEXT NOT NULL DEFAULT '',
    "fbMetaDescription" TEXT NOT NULL DEFAULT '',
    "fbMetaImageUrl" TEXT NOT NULL DEFAULT '',
    "fbMetaImageAlt" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlogFaq" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BlogFaq_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Blog_slug_key" ON "Blog"("slug");
CREATE INDEX IF NOT EXISTS "Blog_publishDate_idx" ON "Blog"("publishDate");
CREATE INDEX IF NOT EXISTS "Blog_createdAt_idx" ON "Blog"("createdAt");
CREATE INDEX IF NOT EXISTS "BlogFaq_blogId_idx" ON "BlogFaq"("blogId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BlogFaq_blogId_fkey'
  ) THEN
    ALTER TABLE "BlogFaq"
      ADD CONSTRAINT "BlogFaq_blogId_fkey"
      FOREIGN KEY ("blogId") REFERENCES "Blog"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
