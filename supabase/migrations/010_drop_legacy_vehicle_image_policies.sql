-- 010_drop_legacy_vehicle_image_policies.sql
-- Supprime les anciennes politiques créées manuellement via le dashboard Supabase.
-- Ces policies USING (true) n'étaient pas dans les migrations et
-- court-circuitaient la nouvelle policy vehicle_images_public_read (migration 009).

DROP POLICY IF EXISTS "public read vehicle images"       ON vehicle_images;
DROP POLICY IF EXISTS "admin full access vehicle images" ON vehicle_images;
