-- 009_fix_rls_policies.sql
-- Corrige les politiques publiques de vehicle_images et service_images.
-- L'ancien USING (true) exposait les images de véhicules en draft.
-- Les nouvelles policies vérifient le statut du parent (véhicule / service).

-- ── vehicle_images ────────────────────────────────────────────────

DROP POLICY IF EXISTS "vehicle_images_public_read"     ON vehicle_images;
DROP POLICY IF EXISTS "vehicle_images_member_read_all" ON vehicle_images;

-- Anon : uniquement les images de véhicules publiquement visibles
CREATE POLICY "vehicle_images_public_read" ON vehicle_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = vehicle_images.vehicle_id
        AND (
          v.status = 'published'
          OR v.status = 'sold'
          OR (v.status = 'scheduled' AND v.published_at <= now())
        )
    )
  );

-- Authentifié : toutes les images du garage (inclut draft, pour l'admin)
CREATE POLICY "vehicle_images_member_read_all" ON vehicle_images FOR SELECT TO authenticated
  USING (garage_id IN (SELECT my_garage_ids()));

-- ── service_images ────────────────────────────────────────────────

DROP POLICY IF EXISTS "service_images_public_read"     ON service_images;
DROP POLICY IF EXISTS "service_images_member_read_all" ON service_images;

-- Anon : uniquement les images de services actifs
CREATE POLICY "service_images_public_read" ON service_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM services s
      WHERE s.id = service_images.service_id
        AND s.is_active = true
    )
  );

-- Authentifié : toutes les images du garage
CREATE POLICY "service_images_member_read_all" ON service_images FOR SELECT TO authenticated
  USING (garage_id IN (SELECT my_garage_ids()));
