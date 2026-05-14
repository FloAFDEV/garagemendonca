-- Migration 015 : ajout colonne hash + champs manquants dans vehicle_images
-- Permet la déduplication SHA1 et le suivi complet des métadonnées d'image

ALTER TABLE vehicle_images
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS mime_type    TEXT,
  ADD COLUMN IF NOT EXISTS width        INTEGER,
  ADD COLUMN IF NOT EXISTS height       INTEGER,
  ADD COLUMN IF NOT EXISTS file_size    INTEGER,
  ADD COLUMN IF NOT EXISTS hash         TEXT,
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ DEFAULT NOW();

-- Index déduplication : un même hash ne peut apparaître qu'une fois par véhicule
CREATE UNIQUE INDEX IF NOT EXISTS vehicle_images_vehicle_hash_idx
  ON vehicle_images(vehicle_id, hash)
  WHERE hash IS NOT NULL;

-- Index storage_path pour les lookups d'idempotence
CREATE INDEX IF NOT EXISTS vehicle_images_storage_path_idx
  ON vehicle_images(storage_path)
  WHERE storage_path IS NOT NULL;
