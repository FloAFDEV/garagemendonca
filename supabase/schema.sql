-- ═══════════════════════════════════════════════════════════════════
--  schema.sql — Garage Auto Mendonca — Schéma Production Consolidé
--
--  Source unique pour une installation propre.
--  Consolide les migrations 001 → 006.
--  Idempotent (IF NOT EXISTS, OR REPLACE, DO … EXCEPTION).
--  Aucune donnée — voir seed.sql.
--
--  Tables : garages, garage_users, vehicle_categories, vehicles,
--           vehicle_images, services, service_images, banners,
--           messages, testimonials, garage_gallery
-- ═══════════════════════════════════════════════════════════════════

-- ── Extensions ────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enums (idempotent via DO block) ───────────────────────────────

DO $$ BEGIN
  CREATE TYPE vehicle_status AS ENUM ('draft', 'published', 'scheduled', 'sold');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE garage_plan AS ENUM ('isolated', 'shared');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE fuel_type AS ENUM ('Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL', 'Hydrogène');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE transmission_type AS ENUM ('Manuelle', 'Automatique');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── TABLE : garages ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS garages (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            text        NOT NULL,
  slug            text        NOT NULL UNIQUE,
  address         text,
  phone           text,
  email           text,
  logo_url        text,
  description     text,
  is_active       boolean     NOT NULL DEFAULT true,
  plan            garage_plan NOT NULL DEFAULT 'isolated',
  city            text,
  postal_code     text,
  lat             numeric(9,6),
  lng             numeric(9,6),
  google_maps_url text,
  opening_hours   jsonb       DEFAULT '{}',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_title       text,
  seo_description text,
  seo_keywords    text[]      DEFAULT '{}',
  og_image_url    text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── TABLE : garage_users ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS garage_users (
  id         uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id  uuid      NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  user_id    uuid      NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       user_role NOT NULL DEFAULT 'staff',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (garage_id, user_id)
);

-- ── TABLE : vehicle_categories ────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_categories (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id   uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  slug        text        NOT NULL,
  label       text        NOT NULL,
  icon        text,
  color       text,
  description text,
  sort_order  smallint    NOT NULL DEFAULT 0,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uniq_category_slug_per_garage UNIQUE (garage_id, slug)
);

-- ── TABLE : vehicles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id               uuid              PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id        uuid              NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  brand            text              NOT NULL,
  model            text              NOT NULL,
  year             integer           NOT NULL CHECK (year BETWEEN 1900 AND 2100),
  mileage          integer           NOT NULL CHECK (mileage >= 0),
  fuel             fuel_type         NOT NULL,
  transmission     transmission_type NOT NULL,
  power            integer           CHECK (power >= 0),
  price            integer           NOT NULL CHECK (price >= 0),
  color            text              NOT NULL,
  doors            integer           DEFAULT 5 CHECK (doors IN (2, 3, 4, 5)),
  crit_air         text,
  description      text,
  images           text[]            DEFAULT '{}',
  thumbnail_url    text,
  status           vehicle_status    NOT NULL DEFAULT 'draft',
  published_at     timestamptz,
  sold_at          timestamptz,
  featured         boolean           NOT NULL DEFAULT false,
  featured_order   integer,
  categories       text[]            DEFAULT '{}',
  features         jsonb             DEFAULT '{}',
  options          jsonb             DEFAULT '{}',
  slug             text,
  meta_description text,
  export_leboncoin boolean           NOT NULL DEFAULT false,
  external_id      text,
  created_at       timestamptz       NOT NULL DEFAULT now(),
  updated_at       timestamptz       NOT NULL DEFAULT now()
);

-- ── TABLE : vehicle_images ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_images (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id   uuid        NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  garage_id    uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  url          text        NOT NULL,
  alt          text,
  sort_order   integer     NOT NULL DEFAULT 0,
  is_primary   boolean     NOT NULL DEFAULT false,
  storage_path text,
  title        text,
  width        integer,
  height       integer,
  mime_type    text        NOT NULL DEFAULT 'image/webp',
  file_size    integer,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vehicle_images_mime_check
    CHECK (mime_type IN ('image/webp','image/jpeg','image/png','image/avif','image/gif'))
);

-- ── TABLE : services ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id         uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  slug              text        NOT NULL,
  sort_order        integer     DEFAULT 0,
  title             text        NOT NULL,
  icon              text        NOT NULL,
  short_description text        NOT NULL,
  long_description  text        NOT NULL,
  features          text[]      DEFAULT '{}',
  steps             jsonb       DEFAULT '[]',
  pricing           jsonb       DEFAULT '[]',
  faq               jsonb       DEFAULT '[]',
  testimonials      jsonb       DEFAULT '[]',
  is_active         boolean     NOT NULL DEFAULT true,
  show_on_homepage  boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uniq_service_slug_per_garage UNIQUE (garage_id, slug)
);

-- ── TABLE : service_images ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_images (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id   uuid        NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  garage_id    uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  url          text        NOT NULL,
  alt          text,
  sort_order   integer     NOT NULL DEFAULT 0,
  is_primary   boolean     NOT NULL DEFAULT false,
  storage_path text,
  title        text,
  width        integer,
  height       integer,
  mime_type    text        NOT NULL DEFAULT 'image/webp',
  file_size    integer,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT service_images_mime_check
    CHECK (mime_type IN ('image/webp','image/jpeg','image/png','image/avif','image/gif'))
);

-- ── TABLE : banners ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id       uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  is_active       boolean     NOT NULL DEFAULT false,
  message         text        NOT NULL,
  sub_message     text,
  image_url       text,
  cta_label       text,
  cta_url         text,
  bg_color        text        NOT NULL DEFAULT '#c8102e',
  scheduled_start timestamptz,
  scheduled_end   timestamptz,
  display_pages   text        NOT NULL DEFAULT 'all'
                  CHECK (display_pages IN ('all', 'home_only')),
  is_dismissible  boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── TABLE : messages ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id  uuid        REFERENCES garages(id) ON DELETE SET NULL,
  vehicle_id uuid        REFERENCES vehicles(id) ON DELETE SET NULL,
  name       text        NOT NULL,
  email      text        NOT NULL,
  phone      text,
  subject    text,
  message    text        NOT NULL,
  read_at    timestamptz,
  status     text        NOT NULL DEFAULT 'new'
             CHECK (status IN ('new', 'read', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── TABLE : testimonials ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id  uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  author     text        NOT NULL,
  initials   text        NOT NULL,
  location   text,
  rating     smallint    NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  date_label text        NOT NULL,
  comment    text        NOT NULL,
  color      text        NOT NULL DEFAULT 'bg-blue-600',
  sort_order smallint    NOT NULL DEFAULT 0,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── TABLE : garage_gallery ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS garage_gallery (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id    uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  url          text        NOT NULL,
  alt          text        NOT NULL,
  caption      text,
  span         text        NOT NULL DEFAULT '',
  sort_order   smallint    NOT NULL DEFAULT 0,
  is_active    boolean     NOT NULL DEFAULT true,
  storage_path text,
  title        text,
  width        integer,
  height       integer,
  mime_type    text        NOT NULL DEFAULT 'image/webp',
  file_size    integer,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT garage_gallery_mime_check
    CHECK (mime_type IN ('image/webp','image/jpeg','image/png','image/avif','image/gif'))
);

-- ── FUNCTION : set_updated_at ─────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── TRIGGERS : updated_at ─────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_garages_updated_at           ON garages;
DROP TRIGGER IF EXISTS trg_vehicle_categories_updated_at ON vehicle_categories;
DROP TRIGGER IF EXISTS trg_vehicles_updated_at           ON vehicles;
DROP TRIGGER IF EXISTS trg_vehicle_images_updated_at     ON vehicle_images;
DROP TRIGGER IF EXISTS trg_services_updated_at           ON services;
DROP TRIGGER IF EXISTS trg_service_images_updated_at     ON service_images;
DROP TRIGGER IF EXISTS trg_banners_updated_at            ON banners;
DROP TRIGGER IF EXISTS trg_testimonials_updated_at       ON testimonials;
DROP TRIGGER IF EXISTS trg_gallery_updated_at            ON garage_gallery;

CREATE TRIGGER trg_garages_updated_at
  BEFORE UPDATE ON garages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_vehicle_categories_updated_at
  BEFORE UPDATE ON vehicle_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_vehicle_images_updated_at
  BEFORE UPDATE ON vehicle_images
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_service_images_updated_at
  BEFORE UPDATE ON service_images
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_gallery_updated_at
  BEFORE UPDATE ON garage_gallery
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── FUNCTION + TRIGGER : cohérence garage vehicle_images ─────────
CREATE OR REPLACE FUNCTION check_vehicle_image_garage()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.id = NEW.vehicle_id
      AND v.garage_id = NEW.garage_id
  ) THEN
    RAISE EXCEPTION 'vehicle_image: vehicle_id and garage_id mismatch';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vehicle_image_garage ON vehicle_images;
CREATE TRIGGER trg_vehicle_image_garage
  BEFORE INSERT OR UPDATE ON vehicle_images
  FOR EACH ROW EXECUTE FUNCTION check_vehicle_image_garage();

-- ── Helper functions (SECURITY DEFINER + SET search_path) ────────

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

-- ── INDEXES ───────────────────────────────────────────────────────

-- vehicles
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
CREATE INDEX IF NOT EXISTS idx_vehicles_export
  ON vehicles(garage_id, export_leboncoin) WHERE export_leboncoin = true;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_vehicle_slug_per_garage_ci
  ON vehicles (garage_id, lower(slug))
  WHERE slug IS NOT NULL;

-- vehicle_images
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle
  ON vehicle_images(vehicle_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_garage
  ON vehicle_images(garage_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_storage
  ON vehicle_images(storage_path) WHERE storage_path IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_primary_image_per_vehicle
  ON vehicle_images (vehicle_id)
  WHERE is_primary = true;

-- vehicle_categories
CREATE INDEX IF NOT EXISTS idx_vc_garage_active
  ON vehicle_categories(garage_id, is_active, sort_order);

-- services
CREATE INDEX IF NOT EXISTS idx_services_garage
  ON services(garage_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_services_homepage
  ON services(garage_id, is_active, sort_order)
  WHERE show_on_homepage = true AND is_active = true;

-- service_images
CREATE INDEX IF NOT EXISTS idx_service_images_service
  ON service_images(service_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_service_images_garage
  ON service_images(garage_id);
CREATE INDEX IF NOT EXISTS idx_service_images_storage
  ON service_images(storage_path) WHERE storage_path IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_primary_service_image
  ON service_images(service_id)
  WHERE is_primary = true;

-- banners
CREATE INDEX IF NOT EXISTS idx_banners_garage_active
  ON banners(garage_id, is_active);

-- messages
CREATE INDEX IF NOT EXISTS idx_messages_garage_unread
  ON messages(garage_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_vehicle
  ON messages(vehicle_id) WHERE vehicle_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_created
  ON messages(created_at DESC);

-- garage_users
CREATE INDEX IF NOT EXISTS idx_gu_garage ON garage_users(garage_id);
CREATE INDEX IF NOT EXISTS idx_gu_user   ON garage_users(user_id);

-- testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_garage
  ON testimonials(garage_id, is_active, sort_order);

-- garage_gallery
CREATE INDEX IF NOT EXISTS idx_gallery_garage
  ON garage_gallery(garage_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_storage
  ON garage_gallery(storage_path) WHERE storage_path IS NOT NULL;

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────
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

-- ── RLS Policies ─────────────────────────────────────────────────

-- garages
DROP POLICY IF EXISTS "garages_public_read"  ON garages;
DROP POLICY IF EXISTS "garages_admin_write"  ON garages;
CREATE POLICY "garages_public_read"  ON garages FOR SELECT USING (is_active = true);
CREATE POLICY "garages_admin_write"  ON garages FOR ALL TO authenticated
  USING (can_write_garage(id));

-- garage_users
DROP POLICY IF EXISTS "gu_member_read"  ON garage_users;
DROP POLICY IF EXISTS "gu_admin_write"  ON garage_users;
CREATE POLICY "gu_member_read" ON garage_users FOR SELECT TO authenticated
  USING (garage_id IN (SELECT my_garage_ids()));
CREATE POLICY "gu_admin_write" ON garage_users FOR ALL TO authenticated
  USING (garage_id IN (
    SELECT garage_id FROM garage_users
    WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  ));

-- vehicle_categories
DROP POLICY IF EXISTS "vc_public_read"  ON vehicle_categories;
DROP POLICY IF EXISTS "vc_admin_write"  ON vehicle_categories;
CREATE POLICY "vc_public_read" ON vehicle_categories FOR SELECT
  USING (is_active = true);
CREATE POLICY "vc_admin_write" ON vehicle_categories FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));

-- vehicles
DROP POLICY IF EXISTS "vehicles_public_read"     ON vehicles;
DROP POLICY IF EXISTS "vehicles_member_read_all" ON vehicles;
DROP POLICY IF EXISTS "vehicles_admin_write"     ON vehicles;
CREATE POLICY "vehicles_public_read" ON vehicles FOR SELECT
  USING (
    status = 'published'
    OR status = 'sold'
    OR (status = 'scheduled' AND published_at <= now())
  );
CREATE POLICY "vehicles_member_read_all" ON vehicles FOR SELECT TO authenticated
  USING (garage_id IN (SELECT my_garage_ids()));
CREATE POLICY "vehicles_admin_write" ON vehicles FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));

-- vehicle_images
DROP POLICY IF EXISTS "vehicle_images_public_read" ON vehicle_images;
DROP POLICY IF EXISTS "vehicle_images_admin_write" ON vehicle_images;
CREATE POLICY "vehicle_images_public_read" ON vehicle_images FOR SELECT USING (true);
CREATE POLICY "vehicle_images_admin_write" ON vehicle_images FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));

-- services
DROP POLICY IF EXISTS "services_public_read" ON services;
DROP POLICY IF EXISTS "services_admin_write" ON services;
CREATE POLICY "services_public_read" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "services_admin_write" ON services FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));

-- service_images
DROP POLICY IF EXISTS "service_images_public_read" ON service_images;
DROP POLICY IF EXISTS "service_images_admin_write" ON service_images;
CREATE POLICY "service_images_public_read" ON service_images FOR SELECT USING (true);
CREATE POLICY "service_images_admin_write" ON service_images FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));

-- banners
DROP POLICY IF EXISTS "banners_public_read" ON banners;
DROP POLICY IF EXISTS "banners_admin_write" ON banners;
CREATE POLICY "banners_public_read" ON banners FOR SELECT
  USING (
    is_active = true
    AND (scheduled_start IS NULL OR scheduled_start <= now())
    AND (scheduled_end   IS NULL OR scheduled_end   >  now())
  );
CREATE POLICY "banners_admin_write" ON banners FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));

-- messages
DROP POLICY IF EXISTS "messages_public_insert" ON messages;
DROP POLICY IF EXISTS "messages_member_read"   ON messages;
DROP POLICY IF EXISTS "messages_member_update" ON messages;
CREATE POLICY "messages_public_insert" ON messages FOR INSERT
  WITH CHECK (
    email ~* '^[^@]+@[^@]+\.[^@]+$'
    AND length(message) > 10
  );
CREATE POLICY "messages_member_read" ON messages FOR SELECT TO authenticated
  USING (garage_id IN (SELECT my_garage_ids()));
CREATE POLICY "messages_member_update" ON messages FOR UPDATE TO authenticated
  USING (garage_id IN (SELECT my_garage_ids()));

-- testimonials
DROP POLICY IF EXISTS "testimonials_public_read" ON testimonials;
DROP POLICY IF EXISTS "testimonials_admin_write" ON testimonials;
CREATE POLICY "testimonials_public_read" ON testimonials FOR SELECT
  USING (is_active = true);
CREATE POLICY "testimonials_admin_write" ON testimonials FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));

-- garage_gallery
DROP POLICY IF EXISTS "gallery_public_read" ON garage_gallery;
DROP POLICY IF EXISTS "gallery_admin_write" ON garage_gallery;
CREATE POLICY "gallery_public_read" ON garage_gallery FOR SELECT
  USING (is_active = true);
CREATE POLICY "gallery_admin_write" ON garage_gallery FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));
