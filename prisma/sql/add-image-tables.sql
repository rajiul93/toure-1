-- Adds Image + ImageUsage tables without touching existing tables in Neon.

CREATE TABLE IF NOT EXISTS "Image" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "alt" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ImageUsage" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT NOT NULL DEFAULT 'default',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Image_key_key" ON "Image"("key");
CREATE INDEX IF NOT EXISTS "Image_createdAt_idx" ON "Image"("createdAt");
CREATE INDEX IF NOT EXISTS "ImageUsage_entityType_entityId_idx" ON "ImageUsage"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "ImageUsage_imageId_idx" ON "ImageUsage"("imageId");
CREATE UNIQUE INDEX IF NOT EXISTS "ImageUsage_imageId_entityType_entityId_field_key" ON "ImageUsage"("imageId", "entityType", "entityId", "field");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ImageUsage_imageId_fkey'
  ) THEN
    ALTER TABLE "ImageUsage"
      ADD CONSTRAINT "ImageUsage_imageId_fkey"
      FOREIGN KEY ("imageId") REFERENCES "Image"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
