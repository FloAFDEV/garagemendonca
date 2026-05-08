-- ═══════════════════════════════════════════════════════════════════
--  006_media_and_security.sql — Garage Auto Mendonca
--
--  Correctifs sécurité + architecture média propre.
--  Idempotent. Aucun seed. Supabase Dashboard > SQL Editor > Run.
--
--  Couvre :
--    A. Sécurité — SET search_path sur toutes les SECURITY DEFINER
--    B. Indexes FK manquants (service_images)
--    C. Colonnes média (vehicle_images, service_images, garage_gallery)
--    D. Triggers updated_at sur vehicle_images et service_images
-- ═══════════════════════════════════════════════════════════════════

-- ── A. Correctifs SECURITY DEFINER — SET search_path = public ────
--
--  Sans SET search_path, une function SECURITY DEFINER est vulnérable
--  au search_path hijacking (CVE pattern reconnu par Supabase linter).

CREATE OR REPLACE FUNCTION my_garage_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT garage_id FROM garage_users WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION can_write_garage(gid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM garage_users
    WHERE garage_id = gid
      AND user_id   = auth.uid()
      AND role      IN ('admin', 'superadmin')
  );
$$;

-- ── B. Indexes FK manquants — service_images ─────────────────────

CREATE INDEX IF NOT EXISTS idx_service_images_service
  ON service_images(service_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_service_images_garage
  ON service_images(garage_id);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_primary_service_image
  ON service_images(service_id)
  WHERE is_primary = true;

-- ── C. Colonnes média — vehicle_images ───────────────────────────
--
--  url           : URL CDN publique (déjà présente, conservée)
--  storage_path  : chemin relatif Supabase Storage ({garage_id}/vehicles/{uuid}.webp)
--  title         : attribut title SEO (optionnel, distinct de alt)
--  width         : largeur px — obligatoire pour next/image layout=fill ou sizes
--  height        : hauteur px — obligatoire pour ratio intrinsèque
--  mime_type     : 'image/webp' | 'image/jpeg' | 'image/avif' …
--  file_size     : octets — UX admin, contrôle upload
--  updated_at    : nécessaire pour invalidation cache

ALTER TABLE vehicle_images
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS title        text,
  ADD COLUMN IF NOT EXISTS width        integer,
  ADD COLUMN IF NOT EXISTS height       integer,
  ADD COLUMN IF NOT EXISTS mime_type    text NOT NULL DEFAULT 'image/webp',
  ADD COLUMN IF NOT EXISTS file_size    integer,
  ADD COLUMN IF NOT EXISTS updated_at   timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_vehicle_images_updated_at ON vehicle_images;
CREATE TRIGGER trg_vehicle_images_updated_at
  BEFORE UPDATE ON vehicle_images
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── C. Colonnes média — service_images ───────────────────────────

ALTER TABLE service_images
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS title        text,
  ADD COLUMN IF NOT EXISTS width        integer,
  ADD COLUMN IF NOT EXISTS height       integer,
  ADD COLUMN IF NOT EXISTS mime_type    text NOT NULL DEFAULT 'image/webp',
  ADD COLUMN IF NOT EXISTS file_size    integer,
  ADD COLUMN IF NOT EXISTS updated_at   timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_service_images_updated_at ON service_images;
CREATE TRIGGER trg_service_images_updated_at
  BEFORE UPDATE ON service_images
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── C. Colonnes média — garage_gallery ───────────────────────────
--
--  updated_at déjà présent (migration 005 / 004).
--  caption et span déjà présents.

ALTER TABLE garage_gallery
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS title        text,
  ADD COLUMN IF NOT EXISTS width        integer,
  ADD COLUMN IF NOT EXISTS height       integer,
  ADD COLUMN IF NOT EXISTS mime_type    text NOT NULL DEFAULT 'image/webp',
  ADD COLUMN IF NOT EXISTS file_size    integer;

-- ── D. CHECK mime_type cohérent sur les 3 tables ─────────────────

ALTER TABLE vehicle_images  DROP CONSTRAINT IF EXISTS vehicle_images_mime_check;
ALTER TABLE service_images  DROP CONSTRAINT IF EXISTS service_images_mime_check;
ALTER TABLE garage_gallery  DROP CONSTRAINT IF EXISTS garage_gallery_mime_check;

ALTER TABLE vehicle_images
  ADD CONSTRAINT vehicle_images_mime_check
  CHECK (mime_type IN ('image/webp','image/jpeg','image/png','image/avif','image/gif'));

ALTER TABLE service_images
  ADD CONSTRAINT service_images_mime_check
  CHECK (mime_type IN ('image/webp','image/jpeg','image/png','image/avif','image/gif'));

ALTER TABLE garage_gallery
  ADD CONSTRAINT garage_gallery_mime_check
  CHECK (mime_type IN ('image/webp','image/jpeg','image/png','image/avif','image/gif'));

-- ── D. Index sur storage_path (lookups admin delete/update) ──────

CREATE INDEX IF NOT EXISTS idx_vehicle_images_storage
  ON vehicle_images(storage_path)
  WHERE storage_path IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_service_images_storage
  ON service_images(storage_path)
  WHERE storage_path IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gallery_storage
  ON garage_gallery(storage_path)
  WHERE storage_path IS NOT NULL;
