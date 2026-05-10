-- ─────────────────────────────────────────────────────────────────
-- 013 — Supabase Storage buckets + RLS + migration images legacy
-- ─────────────────────────────────────────────────────────────────

-- ── 1. Buckets publics ────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'vehicle-images', 'vehicle-images', true,
    10485760,                                  -- 10 MB max
    ARRAY['image/jpeg','image/png','image/webp','image/avif','image/gif']
  ),
  (
    'service-images', 'service-images', true,
    10485760,
    ARRAY['image/jpeg','image/png','image/webp','image/avif']
  ),
  (
    'banner-images', 'banner-images', true,
    15728640,                                  -- 15 MB (banners HD)
    ARRAY['image/jpeg','image/png','image/webp','image/avif']
  )
ON CONFLICT (id) DO NOTHING;

-- ── 2. RLS policies storage ───────────────────────────────────────

-- vehicle-images
CREATE POLICY "vehicle_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-images');

CREATE POLICY "vehicle_images_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vehicle-images' AND auth.role() = 'authenticated');

CREATE POLICY "vehicle_images_auth_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vehicle-images' AND auth.role() = 'authenticated');

CREATE POLICY "vehicle_images_auth_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vehicle-images' AND auth.role() = 'authenticated');

-- service-images
CREATE POLICY "service_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'service-images');

CREATE POLICY "service_images_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'service-images' AND auth.role() = 'authenticated');

CREATE POLICY "service_images_auth_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'service-images' AND auth.role() = 'authenticated');

-- banner-images
CREATE POLICY "banner_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banner-images');

CREATE POLICY "banner_images_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'banner-images' AND auth.role() = 'authenticated');

CREATE POLICY "banner_images_auth_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'banner-images' AND auth.role() = 'authenticated');

-- ── 3. Migration : vehicles.images[] → vehicle_images ────────────
-- Idempotente : ne traite que les véhicules sans entrées vehicle_images.

WITH indexed AS (
  SELECT
    v.id          AS vehicle_id,
    v.garage_id,
    img_url,
    (ROW_NUMBER() OVER (PARTITION BY v.id ORDER BY idx) - 1) AS sort_idx
  FROM vehicles v,
       LATERAL unnest(v.images) WITH ORDINALITY AS u(img_url, idx)
  WHERE
    v.images IS NOT NULL
    AND array_length(v.images, 1) > 0
    AND v.id NOT IN (SELECT DISTINCT vehicle_id FROM vehicle_images)
    AND img_url IS NOT NULL
    AND img_url <> ''
)
INSERT INTO vehicle_images (id, vehicle_id, garage_id, url, sort_order, is_primary, created_at)
SELECT
  gen_random_uuid(),
  vehicle_id,
  garage_id,
  img_url,
  sort_idx,
  sort_idx = 0,
  NOW()
FROM indexed
ON CONFLICT DO NOTHING;
