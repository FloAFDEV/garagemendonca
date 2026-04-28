-- ═══════════════════════════════════════════════════════════════════
--  001_init.sql — Garage Auto Mendonca — Schéma initial (idempotent)
--
--  Sûr à ré-exécuter (IF NOT EXISTS, DROP … IF EXISTS, OR REPLACE).
--  Supabase Dashboard > SQL Editor > Run.
--
--  v4 : enums, tables, indexes, RLS, triggers, données initiales.
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
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            text NOT NULL,
  slug            text NOT NULL UNIQUE,
  address         text,
  phone           text,
  email           text,
  logo_url        text,
  description     text,
  is_active       boolean NOT NULL DEFAULT true,
  plan            garage_plan NOT NULL DEFAULT 'isolated',
  city            text,
  postal_code     text,
  lat             numeric(9,6),
  lng             numeric(9,6),
  google_maps_url text,
  opening_hours   jsonb DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── TABLE : garage_users ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS garage_users (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id   uuid NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'staff',
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (garage_id, user_id)
);

-- ── TABLE : vehicle_categories ────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_categories (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id   uuid NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  slug        text NOT NULL,
  label       text NOT NULL,
  icon        text,
  color       text,
  description text,
  sort_order  smallint NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uniq_category_slug_per_garage UNIQUE (garage_id, slug)
);

-- ── TABLE : vehicles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id       uuid NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  brand           text NOT NULL,
  model           text NOT NULL,
  year            integer NOT NULL CHECK (year BETWEEN 1900 AND 2100),
  mileage         integer NOT NULL CHECK (mileage >= 0),
  fuel            fuel_type NOT NULL,
  transmission    transmission_type NOT NULL,
  power           integer CHECK (power >= 0),
  price           integer NOT NULL CHECK (price >= 0),
  color           text NOT NULL,
  doors           integer DEFAULT 5 CHECK (doors IN (2, 3, 4, 5)),
  crit_air        text,
  description     text,
  images          text[] DEFAULT '{}',
  thumbnail_url   text,
  status          vehicle_status NOT NULL DEFAULT 'draft',
  published_at    timestamptz,
  sold_at         timestamptz,
  featured        boolean NOT NULL DEFAULT false,
  featured_order  integer,
  categories      text[] DEFAULT '{}',
  features        jsonb DEFAULT '{}',
  options         jsonb DEFAULT '{}',
  slug            text,
  meta_description text,
  export_leboncoin boolean NOT NULL DEFAULT false,
  external_id     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── TABLE : vehicle_images ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_images (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id  uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  garage_id   uuid NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  url         text NOT NULL,
  alt         text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_primary  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── TABLE : services ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id         uuid NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  slug              text NOT NULL,
  sort_order        integer DEFAULT 0,
  title             text NOT NULL,
  icon              text NOT NULL,
  short_description text NOT NULL,
  long_description  text NOT NULL,
  features          text[] DEFAULT '{}',
  steps             jsonb DEFAULT '[]',
  pricing           jsonb DEFAULT '[]',
  faq               jsonb DEFAULT '[]',
  testimonials      jsonb DEFAULT '[]',
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uniq_service_slug_per_garage UNIQUE (garage_id, slug)
);

-- ── TABLE : service_images ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_images (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  garage_id  uuid NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  url        text NOT NULL,
  alt        text,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false
);

-- ── TABLE : banners ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id       uuid NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  is_active       boolean NOT NULL DEFAULT false,
  message         text NOT NULL,
  sub_message     text,
  image_url       text,
  cta_label       text,
  cta_url         text,
  bg_color        text NOT NULL DEFAULT '#c8102e',
  scheduled_start timestamptz,
  scheduled_end   timestamptz,
  display_pages   text NOT NULL DEFAULT 'all' CHECK (display_pages IN ('all', 'home_only')),
  is_dismissible  boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── TABLE : messages ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id   uuid REFERENCES garages(id) ON DELETE SET NULL,
  vehicle_id  uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  name        text NOT NULL,
  email       text NOT NULL,
  phone       text,
  subject     text,
  message     text NOT NULL,
  read_at     timestamptz,
  status      text NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'read', 'archived')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── FUNCTION + TRIGGERS : updated_at ─────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_garages_updated_at ON garages;
CREATE TRIGGER trg_garages_updated_at
  BEFORE UPDATE ON garages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_vehicle_categories_updated_at ON vehicle_categories;
CREATE TRIGGER trg_vehicle_categories_updated_at
  BEFORE UPDATE ON vehicle_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_vehicles_updated_at ON vehicles;
CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_services_updated_at ON services;
CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_banners_updated_at ON banners;
CREATE TRIGGER trg_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── FUNCTION + TRIGGER : vehicle_images garage coherence ─────────
CREATE OR REPLACE FUNCTION check_vehicle_image_garage()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM vehicles v
    WHERE v.id = NEW.vehicle_id AND v.garage_id = NEW.garage_id
  ) THEN
    RAISE EXCEPTION 'vehicle_image: vehicle_id and garage_id mismatch';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vehicle_image_garage ON vehicle_images;
CREATE TRIGGER trg_vehicle_image_garage
  BEFORE INSERT OR UPDATE ON vehicle_images
  FOR EACH ROW EXECUTE FUNCTION check_vehicle_image_garage();

-- ── INDEXES ───────────────────────────────────────────────────────
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

CREATE UNIQUE INDEX IF NOT EXISTS uniq_vehicle_slug_per_garage_ci
  ON vehicles (garage_id, lower(slug))
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle ON vehicle_images(vehicle_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_garage  ON vehicle_images(garage_id);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_primary_image_per_vehicle
  ON vehicle_images (vehicle_id)
  WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_vc_garage_active   ON vehicle_categories(garage_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_services_garage    ON services(garage_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_banners_garage_active ON banners(garage_id, is_active);
CREATE INDEX IF NOT EXISTS idx_messages_garage_unread ON messages(garage_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_vehicle   ON messages(vehicle_id) WHERE vehicle_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_created   ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gu_garage          ON garage_users(garage_id);
CREATE INDEX IF NOT EXISTS idx_gu_user            ON garage_users(user_id);

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

-- ── Helper functions ──────────────────────────────────────────────
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

-- ── RLS Policies (DROP + CREATE for idempotency) ──────────────────

-- garages
DROP POLICY IF EXISTS "garages_public_read"  ON garages;
DROP POLICY IF EXISTS "garages_admin_write"  ON garages;
CREATE POLICY "garages_public_read"  ON garages FOR SELECT USING (is_active = true);
CREATE POLICY "garages_admin_write"  ON garages FOR ALL TO authenticated USING (can_write_garage(id));

-- garage_users
DROP POLICY IF EXISTS "gu_member_read"   ON garage_users;
DROP POLICY IF EXISTS "gu_admin_write"   ON garage_users;
CREATE POLICY "gu_member_read"  ON garage_users FOR SELECT TO authenticated
  USING (garage_id IN (SELECT my_garage_ids()));
CREATE POLICY "gu_admin_write"  ON garage_users FOR ALL TO authenticated
  USING (garage_id IN (
    SELECT garage_id FROM garage_users
    WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  ));

-- vehicle_categories
DROP POLICY IF EXISTS "vc_public_read"   ON vehicle_categories;
DROP POLICY IF EXISTS "vc_admin_write"   ON vehicle_categories;
CREATE POLICY "vc_public_read"  ON vehicle_categories FOR SELECT USING (is_active = true);
CREATE POLICY "vc_admin_write"  ON vehicle_categories FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));

-- vehicles
DROP POLICY IF EXISTS "vehicles_public_read"       ON vehicles;
DROP POLICY IF EXISTS "vehicles_member_read_all"   ON vehicles;
DROP POLICY IF EXISTS "vehicles_admin_write"       ON vehicles;
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
DROP POLICY IF EXISTS "vehicle_images_public_read"  ON vehicle_images;
DROP POLICY IF EXISTS "vehicle_images_admin_write"  ON vehicle_images;
CREATE POLICY "vehicle_images_public_read"  ON vehicle_images FOR SELECT USING (true);
CREATE POLICY "vehicle_images_admin_write"  ON vehicle_images FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));

-- services
DROP POLICY IF EXISTS "services_public_read"   ON services;
DROP POLICY IF EXISTS "services_admin_write"   ON services;
CREATE POLICY "services_public_read"  ON services FOR SELECT USING (is_active = true);
CREATE POLICY "services_admin_write"  ON services FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));

-- service_images
DROP POLICY IF EXISTS "service_images_public_read"  ON service_images;
DROP POLICY IF EXISTS "service_images_admin_write"  ON service_images;
CREATE POLICY "service_images_public_read"  ON service_images FOR SELECT USING (true);
CREATE POLICY "service_images_admin_write"  ON service_images FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));

-- banners
DROP POLICY IF EXISTS "banners_public_read"   ON banners;
DROP POLICY IF EXISTS "banners_admin_write"   ON banners;
CREATE POLICY "banners_public_read" ON banners FOR SELECT
  USING (
    is_active = true
    AND (scheduled_start IS NULL OR scheduled_start <= now())
    AND (scheduled_end   IS NULL OR scheduled_end   >  now())
  );
CREATE POLICY "banners_admin_write" ON banners FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));

-- messages
DROP POLICY IF EXISTS "messages_public_insert"  ON messages;
DROP POLICY IF EXISTS "messages_member_read"    ON messages;
DROP POLICY IF EXISTS "messages_member_update"  ON messages;
CREATE POLICY "messages_public_insert" ON messages FOR INSERT
  WITH CHECK (
    email ~* '^[^@]+@[^@]+\.[^@]+$'
    AND length(message) > 10
  );
CREATE POLICY "messages_member_read"   ON messages FOR SELECT TO authenticated
  USING (garage_id IN (SELECT my_garage_ids()));
CREATE POLICY "messages_member_update" ON messages FOR UPDATE TO authenticated
  USING (garage_id IN (SELECT my_garage_ids()));

-- ── Données initiales (ON CONFLICT DO NOTHING — idempotent) ───────
INSERT INTO garages (
  id, name, slug, address, city, postal_code, phone, email,
  plan, lat, lng, description, is_active, google_maps_url, opening_hours
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Garage Auto Mendonca',
  'garage-mendonca',
  '6 Avenue de la Mouyssaguese',
  'Drémil-Lafage',
  '31280',
  '05 32 00 20 38',
  'contact@garagemendonca.com',
  'isolated',
  43.604652,
  1.567890,
  'Spécialiste de la mécanique, carrosserie et vente de véhicules d''occasion japonais à boîte automatique à Drémil-Lafage depuis 2001.',
  true,
  'https://maps.google.com/?q=6+Avenue+de+la+Mouyssaguese+31280+Dr%C3%A9mil-Lafage',
  '{"lundi":{"open":"08:00","close":"19:00"},"mardi":{"open":"08:00","close":"19:00"},"mercredi":{"open":"08:00","close":"19:00"},"jeudi":{"open":"08:00","close":"19:00"},"vendredi":{"open":"08:00","close":"18:00"},"samedi":null,"dimanche":null}'
) ON CONFLICT (id) DO NOTHING;
