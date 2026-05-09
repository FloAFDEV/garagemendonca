-- 008_fix_grants.sql
-- Grants manquants pour les rôles anon et authenticated.
-- PostgREST exige GRANT table-level en plus des politiques RLS.

-- ── anon : lectures publiques ─────────────────────────────────────
GRANT SELECT ON vehicles          TO anon;
GRANT SELECT ON vehicle_images    TO anon;
GRANT SELECT ON vehicle_categories TO anon;
GRANT SELECT ON services          TO anon;
GRANT SELECT ON service_images    TO anon;
GRANT SELECT ON banners           TO anon;
GRANT SELECT ON garages           TO anon;
GRANT INSERT ON messages          TO anon;  -- formulaire de contact

-- ── authenticated : CRUD limité par RLS ──────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON vehicles           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vehicle_images     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vehicle_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON services           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON service_images     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON banners            TO authenticated;
GRANT SELECT                          ON garages            TO authenticated;
GRANT SELECT, INSERT, UPDATE          ON messages           TO authenticated;
GRANT SELECT                          ON garage_users       TO authenticated;
