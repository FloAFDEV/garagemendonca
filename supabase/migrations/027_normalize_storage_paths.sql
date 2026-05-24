-- Migration 027 — Normalize vehicle_images.storage_path to canonical basePath
--
-- Context:
--   Phase 1 introduced multi-variant images. The canonical DB value for
--   storage_path is now the basePath (no extension), e.g.:
--     garageId/vehicles/vehicleId/uuid
--
--   Migration 022 backfilled storage_path from url. If it ran after Phase 1
--   images were uploaded, some rows may have the full variant path instead:
--     garageId/vehicles/vehicleId/uuid-medium.webp   ← needs normalization
--
--   This migration strips the variant suffix to produce the canonical basePath.
--
-- Idempotent:
--   - Rows with variant suffix    → stripped to basePath (may run multiple times safely)
--   - Rows with no extension      → already basePath, untouched
--   - Rows with legacy extension  → single-file legacy, untouched
--   - Rows with NULL storage_path → untouched
--
-- Safe: read-only for legacy rows, no data deleted, no storage modified.

DO $$
DECLARE
  v_variant_rows  INTEGER := 0;
  v_base_rows     INTEGER := 0;
  v_legacy_rows   INTEGER := 0;
  v_null_rows     INTEGER := 0;
  v_updated       INTEGER := 0;
BEGIN
  -- ── Pre-migration counts ──────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_null_rows
  FROM public.vehicle_images WHERE storage_path IS NULL;

  -- Rows with variant suffix (target of this migration)
  SELECT COUNT(*) INTO v_variant_rows
  FROM public.vehicle_images
  WHERE storage_path ~ '-(thumb|medium|large|orig)\.(webp|jpg|jpeg|png)$';

  -- Rows already in basePath form (no extension)
  SELECT COUNT(*) INTO v_base_rows
  FROM public.vehicle_images
  WHERE storage_path IS NOT NULL
    AND storage_path !~ '\.(webp|jpg|jpeg|png|gif)$';

  -- Rows with legacy single-file extension (no variant suffix)
  SELECT COUNT(*) INTO v_legacy_rows
  FROM public.vehicle_images
  WHERE storage_path ~ '\.(webp|jpg|jpeg|png|gif)$'
    AND storage_path !~ '-(thumb|medium|large|orig)\.(webp|jpg|jpeg|png)$';

  RAISE NOTICE '[027] Pre-migration state:';
  RAISE NOTICE '[027]   variant paths (to normalize): %', v_variant_rows;
  RAISE NOTICE '[027]   basePaths (already correct):  %', v_base_rows;
  RAISE NOTICE '[027]   legacy single-file:           %', v_legacy_rows;
  RAISE NOTICE '[027]   NULL (no storage_path):       %', v_null_rows;

  -- ── Normalize: strip variant suffix → canonical basePath ─────────────────
  WITH normalized AS (
    UPDATE public.vehicle_images
    SET    storage_path = regexp_replace(
             storage_path,
             '-(thumb|medium|large|orig)\.(webp|jpg|jpeg|png)$',
             '',
             'i'
           )
    WHERE  storage_path ~ '-(thumb|medium|large|orig)\.(webp|jpg|jpeg|png)$'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_updated FROM normalized;

  RAISE NOTICE '[027] Updated: % rows normalized (variant suffix stripped)', v_updated;
  RAISE NOTICE '[027] Post-migration: all vehicle_images.storage_path values are canonical basePaths or legacy single-file paths.';
END;
$$;
