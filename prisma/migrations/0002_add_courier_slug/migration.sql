-- Add courier slug for courier-specific routes
ALTER TABLE "Courier"
ADD COLUMN "slug" TEXT;

-- Backfill existing records with a readable slug first
UPDATE "Courier"
SET "slug" = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(TRIM("displayName"), '[^a-zA-Z0-9]+', '-', 'g'),
    '(^-|-$)',
    '',
    'g'
  )
)
WHERE "slug" IS NULL
  OR "slug" = '';

-- Final fallback to guaranteed-unique values
UPDATE "Courier"
SET "slug" = CONCAT('courier-', SUBSTRING("id", 1, 8))
WHERE "slug" IS NULL
  OR "slug" = '';

ALTER TABLE "Courier"
ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Courier_slug_key" ON "Courier"("slug");
