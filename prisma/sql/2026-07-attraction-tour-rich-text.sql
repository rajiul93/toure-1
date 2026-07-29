-- Move the Quill-authored fields of "AttractionTour" to rich text.
--
-- Applied with `prisma db execute`, NOT `prisma db push`. This database is
-- shared with another application (User, Student, Course, Enrollment, Follow),
-- and `db push` proposes dropping those tables. See
-- 2026-07-add-attraction-tour.sql for the full note.
--
-- "highlights" (text[]) becomes "highlightsHtml" (text): the admin now writes a
-- list in Quill instead of one input per bullet. Any existing values are folded
-- into a <ul> so nothing is lost, then the old column is dropped.
-- "importantInfo" JSON items move from { items: string[] } to { html: string }
-- for the same reason.

ALTER TABLE "AttractionTour"
  ADD COLUMN IF NOT EXISTS "highlightsHtml" TEXT NOT NULL DEFAULT '';

-- Backfill only where the old column still exists and held values.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'AttractionTour' AND column_name = 'highlights'
  ) THEN
    UPDATE "AttractionTour"
    SET "highlightsHtml" = (
      SELECT '<ul>' || string_agg('<li>' || item || '</li>', '') || '</ul>'
      FROM unnest("highlights") AS item
    )
    WHERE "highlightsHtml" = ''
      AND array_length("highlights", 1) > 0;

    ALTER TABLE "AttractionTour" DROP COLUMN "highlights";
  END IF;
END $$;

-- importantInfo: { id, title, items: [...] } -> { id, title, html: "<ul>…</ul>" }
UPDATE "AttractionTour"
SET "importantInfo" = (
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', section->>'id',
        'title', section->>'title',
        'html', COALESCE(
          section->>'html',
          (
            SELECT '<ul>' || string_agg('<li>' || value || '</li>', '') || '</ul>'
            FROM jsonb_array_elements_text(section->'items') AS value
          ),
          ''
        )
      )
      ORDER BY ordinality
    ),
    '[]'::jsonb
  )
  FROM jsonb_array_elements("importantInfo"::jsonb) WITH ORDINALITY AS t(section, ordinality)
)
WHERE jsonb_typeof("importantInfo"::jsonb) = 'array'
  AND jsonb_array_length("importantInfo"::jsonb) > 0
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements("importantInfo"::jsonb) AS section
    WHERE section ? 'items'
  );

ALTER TABLE "AttractionTour"
  ALTER COLUMN "meetingPointAddress" TYPE TEXT;
