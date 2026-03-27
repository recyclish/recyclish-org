-- Migration: Add structured address fields to user_favorites
-- Replaces the fragile single facilityAddress string with separate city/state/zip columns
-- The original facilityAddress column is kept for backward compatibility

ALTER TABLE "user_favorites"
  ADD COLUMN IF NOT EXISTS "facility_city"  text,
  ADD COLUMN IF NOT EXISTS "facility_state" text,
  ADD COLUMN IF NOT EXISTS "facility_zip"   text;

-- Backfill city from existing facilityAddress (best-effort: "Street, City, State Zip" format)
UPDATE "user_favorites"
SET
  "facility_city"  = TRIM(SPLIT_PART("facility_address", ',', 2)),
  "facility_state" = TRIM(SPLIT_PART(SPLIT_PART("facility_address", ',', 3), ' ', 2)),
  "facility_zip"   = TRIM(SPLIT_PART(SPLIT_PART("facility_address", ',', 3), ' ', 3))
WHERE "facility_address" LIKE '%,%,%';
