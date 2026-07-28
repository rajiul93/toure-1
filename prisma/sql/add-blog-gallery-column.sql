-- Blog photo gallery (array of { id, url, alt_text })
ALTER TABLE "Blog"
ADD COLUMN IF NOT EXISTS "galleryImages" JSONB NOT NULL DEFAULT '[]'::jsonb;
