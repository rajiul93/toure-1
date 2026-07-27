-- Add publish status + soft delete columns to Blog.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PublishStatus') THEN
    CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISH');
  END IF;
END $$;

ALTER TABLE "Blog"
  ADD COLUMN IF NOT EXISTS "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Blog_publishStatus_idx" ON "Blog"("publishStatus");
CREATE INDEX IF NOT EXISTS "Blog_isDeleted_idx" ON "Blog"("isDeleted");
