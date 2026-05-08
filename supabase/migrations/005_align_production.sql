-- ═══════════════════════════════════════════════════════════════════
--  005_align_production.sql — Garage Auto Mendonca
--
--  Alignement DB production → schéma cible (001–004 non appliquées).
--  Idempotent : IF NOT EXISTS, DO $$ EXCEPTION WHEN …, ALTER … IF NOT EXISTS.
--  Aucun seed. Uniquement CREATE / ALTER / DROP structurels.
--  Supabase Dashboard > SQL Editor > Run.
--
--  Couvre :
--    A. Enums manquants / valeurs manquantes
--    B. Fonctions utilitaires
--    C. Alignement tables existantes
--         garages, garage_users, vehicle_categories,
--         vehicles, banners, messages
--    D. Création tables manquantes
--         vehicle_images, services, service_images,
--         testimonials, garage_gallery
--    E. Triggers updated_at
--    F. Indexes
--    G. RLS — enable + policies complètes
-- ═══════════════════════════════════════════════════════════════════

-- ── A. Extensions ────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── A. Enums ─────────────────────────────────────────────────────

-- vehicle_status : ajouter les valeurs cibles (on ne peut pas supprimer 'available')
ALTER TYPE vehicle_status ADD VALUE IF NOT EXISTS 'draft';
ALTER TYPE vehicle_status ADD VALUE IF NOT EXISTS 'published';
ALTER TYPE vehicle_status ADD VALUE IF NOT EXISTS 'scheduled';
ALTER TYPE vehicle_status ADD VALUE IF NOT EXISTS 'sold';

-- user_role (remplace garage_user_role)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- garage_plan
DO $$ BEGIN
  CREATE TYPE garage_plan AS ENUM ('isolated', 'shared');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- fuel_type
DO $$ BEGIN
  CREATE TYPE fuel_type AS ENUM (
    'Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL', 'Hydrogène'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- transmission_type
DO $$ BEGIN
  CREATE TYPE transmission_type AS ENUM ('Manuelle', 'Automatique');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── B. Fonctions utilitaires ──────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION my_garage_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT garage_id FROM garage_users WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION can_write_garage(gid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM garage_users
    WHERE garage_id = gid
      AND user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
  );
$$;

-- ── C.1 garages — colonnes manquantes ────────────────────────────

ALTER TABLE garages
  ADD COLUMN IF NOT EXISTS plan             text        NOT NULL DEFAULT 'isolated',
  ADD COLUMN IF NOT EXISTS lat              numeric(9,6),
  ADD COLUMN IF NOT EXISTS lng              numeric(9,6),
  ADD COLUMN IF NOT EXISTS google_maps_url  text,
  ADD COLUMN IF NOT EXISTS opening_hours    jsonb       DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS content          jsonb       NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS seo_title        text,
  ADD COLUMN IF NOT EXISTS seo_description  text,
  ADD COLUMN IF NOT EXISTS seo_keywords     text[]      DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS og_image_url     text;

DROP TRIGGER IF EXISTS trg_garages_updated_at ON garages;
CREATE TRIGGER trg_garages_updated_at
  BEFORE UPDATE ON garages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── C.2 garage_users — migration enum + contrainte UNIQUE ────────

-- Convertir la colonne role de garage_user_role → user_role
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'garage_users'
      AND column_name  = 'role'
      AND udt_name     = 'garage_user_role'
  ) THEN
    ALTER TABLE garage_users
      ALTER COLUMN role TYPE user_role
      USING (CASE role::text
               WHEN 'superadmin' THEN 'superadmin'
               WHEN 'admin'      THEN 'admin'
               ELSE              'staff'
             END)::user_role;
    ALTER TABLE garage_users ALTER COLUMN role SET DEFAULT 'staff'::user_role;
  END IF;
END $$;

-- Contrainte UNIQUE (garage_id, user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.garage_users'::regclass
      AND contype   = 'u'
      AND conname   = 'garage_users_garage_user_unique'
  ) THEN
    ALTER TABLE garage_users
      ADD CONSTRAINT garage_users_garage_user_unique UNIQUE (garage_id, user_id);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── C.3 vehicle_categories — colonnes manquantes ─────────────────

ALTER TABLE vehicle_categories
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS updated_at  timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_vehicle_categories_updated_at ON vehicle_categories;
CREATE TRIGGER trg_vehicle_categories_updated_at
  BEFORE UPDATE ON vehicle_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.vehicle_categories'::regclass
      AND contype   = 'u'
      AND conname   = 'uniq_category_slug_per_garage'
  ) THEN
    ALTER TABLE vehicle_categories
      ADD CONSTRAINT uniq_category_slug_per_garage UNIQUE (garage_id, slug);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── C.4 vehicles — colonnes manquantes + migrations ──────────────

-- 1. Ajouter garage_id (nullable d'abord)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS garage_id uuid;

-- 2. Peupler garage_id depuis garage_vehicles si la table existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'garage_vehicles'
  ) THEN
    UPDATE vehicles v
    SET    garage_id = gv.garage_id
    FROM   garage_vehicles gv
    WHERE  gv.vehicle_id = v.id
      AND  v.garage_id IS NULL;
  END IF;
END $$;

-- 3. Fallback : garage unique par défaut pour les lignes sans garage_id
UPDATE vehicles
SET    garage_id = '00000000-0000-0000-0000-000000000001'
WHERE  garage_id IS NULL
  AND  EXISTS (
         SELECT 1 FROM garages
         WHERE id = '00000000-0000-0000-0000-000000000001'
       );

-- 4. NOT NULL + FK (uniquement si toutes les lignes ont un garage_id)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vehicles WHERE garage_id IS NULL) THEN
    BEGIN
      ALTER TABLE vehicles ALTER COLUMN garage_id SET NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.vehicles'::regclass
      AND conname  = 'vehicles_garage_id_fkey'
  ) THEN
    BEGIN
      ALTER TABLE vehicles
        ADD CONSTRAINT vehicles_garage_id_fkey
        FOREIGN KEY (garage_id) REFERENCES garages(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;
END $$;

-- 5. Migrer status 'available' → 'published'
UPDATE vehicles SET status = 'published'::vehicle_status WHERE status::text = 'available';
ALTER TABLE vehicles ALTER COLUMN status SET DEFAULT 'draft'::vehicle_status;

-- 6. year smallint → integer
ALTER TABLE vehicles ALTER COLUMN year TYPE integer USING year::integer;

-- 7. power smallint NOT NULL → integer nullable
ALTER TABLE vehicles ALTER COLUMN power TYPE integer USING power::integer;
ALTER TABLE vehicles ALTER COLUMN power DROP NOT NULL;

-- 8. color : garantir NOT NULL (valeur neutre si NULL)
UPDATE vehicles SET color = '' WHERE color IS NULL;
DO $$
BEGIN
  ALTER TABLE vehicles ALTER COLUMN color SET NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 9. fuel text+CHECK → fuel_type enum
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'vehicles'
      AND column_name  = 'fuel'
      AND data_type    = 'text'
  ) THEN
    ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_fuel_check;
    ALTER TABLE vehicles ALTER COLUMN fuel
      TYPE fuel_type USING fuel::fuel_type;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 10. transmission text+CHECK → transmission_type enum
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'vehicles'
      AND column_name  = 'transmission'
      AND data_type    = 'text'
  ) THEN
    ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_transmission_check;
    ALTER TABLE vehicles ALTER COLUMN transmission
      TYPE transmission_type USING transmission::transmission_type;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 11. Colonnes manquantes
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS published_at     timestamptz,
  ADD COLUMN IF NOT EXISTS sold_at          timestamptz,
  ADD COLUMN IF NOT EXISTS categories       text[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS options          jsonb    DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS slug             text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS export_leboncoin boolean  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS external_id      text;

-- 12. Index UNIQUE partiel sur slug
CREATE UNIQUE INDEX IF NOT EXISTS uniq_vehicle_slug_per_garage_ci
  ON vehicles (garage_id, lower(slug))
  WHERE slug IS NOT NULL;

DROP TRIGGER IF EXISTS trg_vehicles_updated_at ON vehicles;
CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── C.5 banners — colonnes manquantes ────────────────────────────

ALTER TABLE banners
  ADD COLUMN IF NOT EXISTS image_url text;

UPDATE banners SET bg_color = '#c8102e' WHERE bg_color IS NULL;
DO $$
BEGIN
  ALTER TABLE banners ALTER COLUMN bg_color SET NOT NULL;
  ALTER TABLE banners ALTER COLUMN bg_color SET DEFAULT '#c8102e';
  ALTER TABLE banners ALTER COLUMN is_active SET NOT NULL;
  ALTER TABLE banners ALTER COLUMN is_active SET DEFAULT false;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- CHECK display_pages
ALTER TABLE banners DROP CONSTRAINT IF EXISTS banners_display_pages_check;
ALTER TABLE banners ADD CONSTRAINT banners_display_pages_check
  CHECK (display_pages IN ('all', 'home_only'));

DROP TRIGGER IF EXISTS trg_banners_updated_at ON banners;
CREATE TRIGGER trg_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── C.6 messages — read_at + status ──────────────────────────────

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS read_at timestamptz,
  ADD COLUMN IF NOT EXISTS status  text NOT NULL DEFAULT 'new';

ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_status_check;
ALTER TABLE messages ADD CONSTRAINT messages_status_check
  CHECK (status IN ('new', 'read', 'archived'));

-- Migrer is_read → status + read_at (si colonne is_read existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'messages'
      AND column_name  = 'is_read'
  ) THEN
    UPDATE messages
    SET    status  = 'read',
           read_at = COALESCE(read_at, created_at)
    WHERE  is_read = true
      AND  status  = 'new';
  END IF;
END $$;

-- ── D.1 vehicle_images ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vehicle_images (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id  uuid        NOT NULL REFERENCES vehicles(id)  ON DELETE CASCADE,
  garage_id   uuid        NOT NULL REFERENCES garages(id)   ON DELETE CASCADE,
  url         text        NOT NULL,
  alt         text,
  sort_order  integer     NOT NULL DEFAULT 0,
  is_primary  boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION check_vehicle_image_garage()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.id = NEW.vehicle_id AND v.garage_id = NEW.garage_id
  ) THEN
    RAISE EXCEPTION 'vehicle_image: vehicle_id/garage_id mismatch';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vehicle_image_garage ON vehicle_images;
CREATE TRIGGER trg_vehicle_image_garage
  BEFORE INSERT OR UPDATE ON vehicle_images
  FOR EACH ROW EXECUTE FUNCTION check_vehicle_image_garage();

-- ── D.2 services ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS services (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id         uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  slug              text        NOT NULL,
  sort_order        integer     DEFAULT 0,
  title             text        NOT NULL,
  icon              text        NOT NULL DEFAULT '',
  short_description text        NOT NULL DEFAULT '',
  long_description  text        NOT NULL DEFAULT '',
  features          text[]      DEFAULT '{}',
  steps             jsonb       DEFAULT '[]',
  pricing           jsonb       DEFAULT '[]',
  faq               jsonb       DEFAULT '[]',
  testimonials      jsonb       DEFAULT '[]',
  show_on_homepage  boolean     NOT NULL DEFAULT true,
  is_active         boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uniq_service_slug_per_garage UNIQUE (garage_id, slug)
);

DROP TRIGGER IF EXISTS trg_services_updated_at ON services;
CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── D.3 service_images ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS service_images (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id uuid        NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  garage_id  uuid        NOT NULL REFERENCES garages(id)  ON DELETE CASCADE,
  url        text        NOT NULL,
  alt        text,
  sort_order integer     NOT NULL DEFAULT 0,
  is_primary boolean     NOT NULL DEFAULT false
);

-- ── D.4 testimonials ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS testimonials (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id    uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  author       text        NOT NULL,
  location     text,
  date_label   text,
  rating       smallint    NOT NULL DEFAULT 5
               CHECK (rating BETWEEN 1 AND 5),
  content      text        NOT NULL,
  avatar_color text        NOT NULL DEFAULT '#2563eb',
  source       text        NOT NULL DEFAULT 'direct'
               CHECK (source IN ('direct', 'google', 'leboncoin', 'other')),
  is_active    boolean     NOT NULL DEFAULT true,
  sort_order   smallint    NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_testimonials_updated_at ON testimonials;
CREATE TRIGGER trg_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── D.5 garage_gallery ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS garage_gallery (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id   uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  url         text        NOT NULL,
  alt         text        NOT NULL DEFAULT '',
  caption     text,
  span        text        NOT NULL DEFAULT 'normal'
              CHECK (span IN ('normal', 'large')),
  sort_order  smallint    NOT NULL DEFAULT 0,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_garage_gallery_updated_at ON garage_gallery;
CREATE TRIGGER trg_garage_gallery_updated_at
  BEFORE UPDATE ON garage_gallery
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── E. Indexes ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_vehicles_garage_id    ON vehicles(garage_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status       ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_featured     ON vehicles(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_vehicles_status_price ON vehicles(status, price);
CREATE INDEX IF NOT EXISTS idx_vehicles_status_km    ON vehicles(status, mileage);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand        ON vehicles(brand);
CREATE INDEX IF NOT EXISTS idx_vehicles_fuel         ON vehicles(fuel);
CREATE INDEX IF NOT EXISTS idx_vehicles_year         ON vehicles(year DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at   ON vehicles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_published_at ON vehicles(published_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_vehicles_features     ON vehicles USING gin(features);
CREATE INDEX IF NOT EXISTS idx_vehicles_options      ON vehicles USING gin(options);
CREATE INDEX IF NOT EXISTS idx_vehicles_categories   ON vehicles USING gin(categories);
CREATE INDEX IF NOT EXISTS idx_vehicles_export       ON vehicles(garage_id, export_leboncoin) WHERE export_leboncoin = true;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_primary_image_per_vehicle
  ON vehicle_images (vehicle_id) WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle ON vehicle_images(vehicle_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_garage  ON vehicle_images(garage_id);

CREATE INDEX IF NOT EXISTS idx_vc_garage_active      ON vehicle_categories(garage_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_services_garage       ON services(garage_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_services_homepage     ON services(garage_id, is_active, sort_order)
  WHERE show_on_homepage = true AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_banners_garage_active  ON banners(garage_id, is_active);
CREATE INDEX IF NOT EXISTS idx_messages_garage_unread ON messages(garage_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_vehicle       ON messages(vehicle_id) WHERE vehicle_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_created       ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gu_garage              ON garage_users(garage_id);
CREATE INDEX IF NOT EXISTS idx_gu_user                ON garage_users(user_id);

CREATE INDEX IF NOT EXISTS idx_testimonials_garage_active
  ON testimonials(garage_id, is_active, sort_order)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_gallery_garage_active
  ON garage_gallery(garage_id, is_active, sort_order)
  WHERE is_active = true;

-- ── F. RLS — enable ───────────────────────────────────────────────

ALTER TABLE garages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE services           ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners            ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials       ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_gallery     ENABLE ROW LEVEL SECURITY;

-- ── F. RLS — garages ─────────────────────────────────────────────

DROP POLICY IF EXISTS "garages_public_read"  ON garages;
DROP POLICY IF EXISTS "garages_admin_write"  ON garages;

CREATE POLICY "garages_public_read" ON garages
  FOR SELECT USING (is_active = true);

CREATE POLICY "garages_admin_write" ON garages
  FOR ALL TO authenticated
  USING (can_write_garage(id));

-- ── F. RLS — garage_users ─────────────────────────────────────────

DROP POLICY IF EXISTS "gu_member_read"  ON garage_users;
DROP POLICY IF EXISTS "gu_admin_write"  ON garage_users;

CREATE POLICY "gu_member_read" ON garage_users
  FOR SELECT TO authenticated
  USING (garage_id IN (SELECT my_garage_ids()));

CREATE POLICY "gu_admin_write" ON garage_users
  FOR ALL TO authenticated
  USING (
    garage_id IN (
      SELECT garage_id FROM garage_users
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- ── F. RLS — vehicle_categories ──────────────────────────────────

DROP POLICY IF EXISTS "vc_public_read"  ON vehicle_categories;
DROP POLICY IF EXISTS "vc_admin_write"  ON vehicle_categories;

CREATE POLICY "vc_public_read" ON vehicle_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "vc_admin_write" ON vehicle_categories
  FOR ALL TO authenticated
  USING (can_write_garage(garage_id))
  WITH CHECK (can_write_garage(garage_id));

-- ── F. RLS — vehicles ─────────────────────────────────────────────

DROP POLICY IF EXISTS "vehicles_public_read"      ON vehicles;
DROP POLICY IF EXISTS "vehicles_member_read_all"  ON vehicles;
DROP POLICY IF EXISTS "vehicles_admin_write"      ON vehicles;

CREATE POLICY "vehicles_public_read" ON vehicles
  FOR SELECT USING (
    status = 'published'
    OR status = 'sold'
    OR (status = 'scheduled' AND published_at <= now())
  );

CREATE POLICY "vehicles_member_read_all" ON vehicles
  FOR SELECT TO authenticated
  USING (garage_id IN (SELECT my_garage_ids()));

CREATE POLICY "vehicles_admin_write" ON vehicles
  FOR ALL TO authenticated
  USING (can_write_garage(garage_id))
  WITH CHECK (can_write_garage(garage_id));

-- ── F. RLS — vehicle_images ───────────────────────────────────────

DROP POLICY IF EXISTS "vehicle_images_public_read"  ON vehicle_images;
DROP POLICY IF EXISTS "vehicle_images_admin_write"  ON vehicle_images;

CREATE POLICY "vehicle_images_public_read" ON vehicle_images
  FOR SELECT USING (true);

CREATE POLICY "vehicle_images_admin_write" ON vehicle_images
  FOR ALL TO authenticated
  USING (can_write_garage(garage_id))
  WITH CHECK (can_write_garage(garage_id));

-- ── F. RLS — services ─────────────────────────────────────────────

DROP POLICY IF EXISTS "services_public_read"  ON services;
DROP POLICY IF EXISTS "services_admin_write"  ON services;

CREATE POLICY "services_public_read" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "services_admin_write" ON services
  FOR ALL TO authenticated
  USING (can_write_garage(garage_id))
  WITH CHECK (can_write_garage(garage_id));

-- ── F. RLS — service_images ───────────────────────────────────────

DROP POLICY IF EXISTS "service_images_public_read"  ON service_images;
DROP POLICY IF EXISTS "service_images_admin_write"  ON service_images;

CREATE POLICY "service_images_public_read" ON service_images
  FOR SELECT USING (true);

CREATE POLICY "service_images_admin_write" ON service_images
  FOR ALL TO authenticated
  USING (can_write_garage(garage_id))
  WITH CHECK (can_write_garage(garage_id));

-- ── F. RLS — banners ──────────────────────────────────────────────

DROP POLICY IF EXISTS "banners_public_read"  ON banners;
DROP POLICY IF EXISTS "banners_admin_write"  ON banners;

CREATE POLICY "banners_public_read" ON banners
  FOR SELECT USING (
    is_active = true
    AND (scheduled_start IS NULL OR scheduled_start <= now())
    AND (scheduled_end   IS NULL OR scheduled_end   >  now())
  );

CREATE POLICY "banners_admin_write" ON banners
  FOR ALL TO authenticated
  USING (can_write_garage(garage_id))
  WITH CHECK (can_write_garage(garage_id));

-- ── F. RLS — messages ─────────────────────────────────────────────

DROP POLICY IF EXISTS "messages_public_insert"  ON messages;
DROP POLICY IF EXISTS "messages_member_read"    ON messages;
DROP POLICY IF EXISTS "messages_member_update"  ON messages;

CREATE POLICY "messages_public_insert" ON messages
  FOR INSERT WITH CHECK (
    email   ~* '^[^@]+@[^@]+\.  [^@]+$'
    AND length(message) > 10
  );

CREATE POLICY "messages_member_read" ON messages
  FOR SELECT TO authenticated
  USING (garage_id IN (SELECT my_garage_ids()));

CREATE POLICY "messages_member_update" ON messages
  FOR UPDATE TO authenticated
  USING (garage_id IN (SELECT my_garage_ids()));

-- ── F. RLS — testimonials ─────────────────────────────────────────

DROP POLICY IF EXISTS "testimonials_public_read"  ON testimonials;
DROP POLICY IF EXISTS "testimonials_admin_write"  ON testimonials;

CREATE POLICY "testimonials_public_read" ON testimonials
  FOR SELECT USING (is_active = true);

CREATE POLICY "testimonials_admin_write" ON testimonials
  FOR ALL TO authenticated
  USING (can_write_garage(garage_id))
  WITH CHECK (can_write_garage(garage_id));

-- ── F. RLS — garage_gallery ───────────────────────────────────────

DROP POLICY IF EXISTS "gallery_public_read"  ON garage_gallery;
DROP POLICY IF EXISTS "gallery_admin_write"  ON garage_gallery;

CREATE POLICY "gallery_public_read" ON garage_gallery
  FOR SELECT USING (is_active = true);

CREATE POLICY "gallery_admin_write" ON garage_gallery
  FOR ALL TO authenticated
  USING (can_write_garage(garage_id))
  WITH CHECK (can_write_garage(garage_id));
