-- 011_apply_007_tables_and_grants.sql
-- Les tables de migration 007 ont été créées via execute_sql car la migration
-- était déjà marquée "applied" (repair). Ce fichier trace les GRANTs manquants.
-- Les CREATE TABLE ont été exécutés directement en live.

GRANT SELECT ON garage_content            TO anon;
GRANT SELECT ON garage_stats              TO anon;
GRANT SELECT ON garage_trust_badges       TO anon;
GRANT SELECT ON garage_reassurances       TO anon;
GRANT SELECT ON garage_cta_guarantees     TO anon;
GRANT SELECT ON garage_vehicle_guarantees TO anon;
GRANT SELECT ON service_steps             TO anon;
GRANT SELECT ON service_pricing           TO anon;
GRANT SELECT ON service_faq               TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON garage_content            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON garage_stats              TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON garage_trust_badges       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON garage_reassurances       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON garage_cta_guarantees     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON garage_vehicle_guarantees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON service_steps             TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON service_pricing           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON service_faq               TO authenticated;
