-- 012_external_id_index.sql
-- Index sur external_id pour le scraping idempotent (lookup rapide).
-- La colonne external_id existe déjà (migration 001/005).

CREATE UNIQUE INDEX IF NOT EXISTS vehicles_garage_external_id_idx
  ON vehicles (garage_id, external_id)
  WHERE external_id IS NOT NULL;
