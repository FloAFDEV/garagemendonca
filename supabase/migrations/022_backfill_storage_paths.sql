-- Migration 022 — Backfill storage_path from url for vehicle_images and service_images
--
-- Context: some rows in vehicle_images / service_images have storage_path = NULL
-- but url contains a full Supabase URL (public or signed).
-- After this migration, storage_path is the single source of truth and
-- the application no longer needs to parse urls at runtime.
--
-- The regex extracts the path segment after the bucket name, handling both:
--   /storage/v1/object/public/<bucket>/<path>
--   /storage/v1/object/sign/<bucket>/<path>?token=...
--
-- This is idempotent: rows that already have storage_path are left untouched.

-- ── vehicle_images ────────────────────────────────────────────────────────────
UPDATE public.vehicle_images
SET    storage_path = (
         regexp_match(
           url,
           '/storage/v1/object/(?:public|sign)/[^/?]+/([^?]+)'
         )
       )[1]
WHERE  storage_path IS NULL
  AND  url ~ '/storage/v1/object/(?:public|sign)/';

-- ── service_images ────────────────────────────────────────────────────────────
UPDATE public.service_images
SET    storage_path = (
         regexp_match(
           url,
           '/storage/v1/object/(?:public|sign)/[^/?]+/([^?]+)'
         )
       )[1]
WHERE  storage_path IS NULL
  AND  url ~ '/storage/v1/object/(?:public|sign)/';

-- ── vehicles.images[] JSONB ───────────────────────────────────────────────────
-- Rebuild the images[] array replacing any signed/public Supabase URLs with
-- permanent public URLs using the extracted storage_path.
-- Requires NEXT_PUBLIC_SUPABASE_URL to be known at migration time — substitute
-- the actual project URL below (or run via application code instead).
--
-- NOTE: if you prefer to keep images[] untouched and rely on the application-layer
-- normalisation added in vehicle-images.ts, you can skip this block.
-- It is included here for completeness to sanitise the database at rest.
--
-- Replace 'YOUR_SUPABASE_PROJECT_URL' with the actual value before running.
-- Example: 'https://abcdefgh.supabase.co'
--
-- UPDATE public.vehicles
-- SET    images = (
--          SELECT jsonb_agg(
--            CASE
--              WHEN elem::text ~ '/storage/v1/object/(?:public|sign)/'
--              THEN to_jsonb(
--                     concat(
--                       'YOUR_SUPABASE_PROJECT_URL',
--                       '/storage/v1/object/public/vehicle-images/',
--                       (regexp_match(elem::text, '/storage/v1/object/(?:public|sign)/[^/?]+/([^?]+)'))[1]
--                     )
--                   )
--              ELSE elem
--            END
--          )
--          FROM jsonb_array_elements(images) AS elem
--        )
-- WHERE  images IS NOT NULL
--   AND  images != '[]'::jsonb
--   AND  images::text ~ '/storage/v1/object/(?:public|sign)/';
