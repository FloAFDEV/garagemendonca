-- ============================================================
--  Garage Auto Mendonca — Supabase Schema v2 (Production)
--  PostgreSQL / Supabase — Multi-garage ready, RLS sécurisé
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
--  TYPES ENUM
-- ────────────────────────────────────────────────────────────

-- Statut métier du véhicule (remplace le bool is_available)
CREATE TYPE vehicle_status AS ENUM ('available', 'reserved', 'sold');

-- Rôle d'un utilisateur dans un garage
CREATE TYPE garage_user_role AS ENUM ('owner', 'editor', 'viewer');

-- ────────────────────────────────────────────────────────────
--  1. GARAGES
-- ────────────────────────────────────────────────────────────
CREATE TABLE garages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  address      TEXT,
  city         TEXT,
  postal_code  TEXT,
  phone        TEXT,
  email        TEXT,
  logo_url     TEXT,
  description  TEXT,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
--  2. GARAGE_USERS — utilisateurs liés à un garage
--     Un utilisateur peut appartenir à plusieurs garages.
--     Le rôle 'owner' peut gérer les membres.
--     Le rôle 'editor' peut créer/modifier/supprimer des véhicules.
--     Le rôle 'viewer' peut seulement lire (ex: comptable, partenaire).
-- ────────────────────────────────────────────────────────────
CREATE TABLE garage_users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id   UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        garage_user_role NOT NULL DEFAULT 'editor',
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (garage_id, user_id)
);

-- ────────────────────────────────────────────────────────────
--  3. VEHICLES
--
--  Champs clés :
--  - status vehicle_status  → available / reserved / sold
--  - featured BOOLEAN       → mis en avant sur la homepage
--  - featured_order INT     → ordre d'affichage des "à la une"
--
--  JSONB features — structure typée recommandée :
--  {
--    "finition"           : "Acenta",
--    "motorisation"       : "1.4 88 ch",
--    "provenance"         : "Francaise",
--    "nbProprietaires"    : "1",
--    "carnetEntretien"    : "À jour",
--    "controleTechnique"  : "À jour",
--    "garantie"           : "6 à 12 mois km illimités",
--    "options"            : "Toit ouvrant, clim auto, bluetooth"
--  }
--  → Clés libres autorisées pour des spécificités métier.
--  → Côté Next.js, utiliser le type VehicleFeatures (types/index.ts).
-- ────────────────────────────────────────────────────────────
CREATE TABLE vehicles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand           TEXT NOT NULL,
  model           TEXT NOT NULL,
  year            SMALLINT NOT NULL CHECK (year BETWEEN 1900 AND 2100),
  mileage         INTEGER NOT NULL CHECK (mileage >= 0),
  fuel            TEXT NOT NULL CHECK (fuel IN ('Essence','Diesel','Hybride','Électrique','GPL','Hydrogène')),
  transmission    TEXT NOT NULL CHECK (transmission IN ('Manuelle','Automatique')),
  power           SMALLINT NOT NULL CHECK (power > 0),
  color           TEXT,
  doors           SMALLINT DEFAULT 5,
  price           INTEGER NOT NULL CHECK (price >= 0),
  crit_air        TEXT CHECK (crit_air IN ('E','1','2','3','4','5')),
  description     TEXT,

  -- Statut et mise en avant
  status          vehicle_status NOT NULL DEFAULT 'available',
  featured        BOOLEAN NOT NULL DEFAULT false,
  featured_order  INTEGER,           -- NULL = non mis en avant, sinon position 1-N

  -- Médias
  images          TEXT[] DEFAULT '{}',   -- Supabase Storage public URLs
  thumbnail_url   TEXT,                  -- image principale (cache URL rapide)

  -- Caractéristiques libres typées
  features        JSONB DEFAULT '{}',

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
--  4. GARAGE_VEHICLES — pivot garage ↔ véhicule
--     Chaque garage contrôle la visibilité et l'ordre.
--     Un véhicule peut être partagé entre plusieurs garages.
-- ────────────────────────────────────────────────────────────
CREATE TABLE garage_vehicles (
  garage_id      UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  vehicle_id     UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  display_order  INTEGER DEFAULT 0,
  is_visible     BOOLEAN DEFAULT true,
  added_at       TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (garage_id, vehicle_id)
);

-- ────────────────────────────────────────────────────────────
--  5. MESSAGES
-- ────────────────────────────────────────────────────────────
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id   UUID REFERENCES garages(id) ON DELETE SET NULL,
  vehicle_id  UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  subject     TEXT,
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
--  6. TRIGGERS updated_at
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_garages_updated_at
  BEFORE UPDATE ON garages FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ────────────────────────────────────────────────────────────
--  7. INDEX — performance filtres + tris
-- ────────────────────────────────────────────────────────────

-- Filtres simples
CREATE INDEX idx_v_brand        ON vehicles (brand);
CREATE INDEX idx_v_fuel         ON vehicles (fuel);
CREATE INDEX idx_v_status       ON vehicles (status);
CREATE INDEX idx_v_featured     ON vehicles (featured, featured_order) WHERE featured = true;

-- Index composites — combinaisons fréquentes
-- ex: WHERE status = 'available' ORDER BY price ASC
CREATE INDEX idx_v_status_price    ON vehicles (status, price);
-- ex: WHERE status = 'available' ORDER BY mileage ASC
CREATE INDEX idx_v_status_mileage  ON vehicles (status, mileage);
-- ex: WHERE status = 'available' AND brand = X
CREATE INDEX idx_v_status_brand    ON vehicles (status, brand);
-- ex: WHERE status = 'available' AND fuel = X AND price <= Y
CREATE INDEX idx_v_fuel_price      ON vehicles (fuel, price) WHERE status = 'available';
-- Tri récent
CREATE INDEX idx_v_created_at      ON vehicles (created_at DESC);
CREATE INDEX idx_v_year_desc       ON vehicles (year DESC);

-- JSONB GIN — requêtes sur features (ex: features->>'finition')
CREATE INDEX idx_v_features     ON vehicles USING GIN (features);

-- Pivot
CREATE INDEX idx_gv_garage      ON garage_vehicles (garage_id, is_visible, display_order);
CREATE INDEX idx_gv_vehicle     ON garage_vehicles (vehicle_id);

-- Utilisateurs par garage
CREATE INDEX idx_gu_user        ON garage_users (user_id);
CREATE INDEX idx_gu_garage_role ON garage_users (garage_id, role);

-- Messages
CREATE INDEX idx_msg_garage     ON messages (garage_id, is_read);
CREATE INDEX idx_msg_vehicle    ON messages (vehicle_id);

-- ────────────────────────────────────────────────────────────
--  8. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────
ALTER TABLE garages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages        ENABLE ROW LEVEL SECURITY;

-- ── Helper : renvoie les garage_ids de l'utilisateur courant ──
CREATE OR REPLACE FUNCTION my_garage_ids()
RETURNS SETOF UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT garage_id FROM garage_users WHERE user_id = auth.uid();
$$;

-- ── Helper : vérifie si l'utilisateur est owner ou editor ──
CREATE OR REPLACE FUNCTION can_edit_garage(gid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM garage_users
    WHERE garage_id = gid
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
  );
$$;

-- ── GARAGES ──
-- Lecture : tous peuvent lire les garages actifs
CREATE POLICY "garages_public_read" ON garages FOR SELECT USING (is_active = true);
-- Écriture : seul l'owner de ce garage
CREATE POLICY "garages_owner_update" ON garages FOR UPDATE TO authenticated
  USING (id IN (SELECT garage_id FROM garage_users WHERE user_id = auth.uid() AND role = 'owner'))
  WITH CHECK (id IN (SELECT garage_id FROM garage_users WHERE user_id = auth.uid() AND role = 'owner'));

-- ── GARAGE_USERS ──
-- Lecture : un utilisateur voit les membres de ses garages
CREATE POLICY "garage_users_member_read" ON garage_users FOR SELECT TO authenticated
  USING (garage_id IN (SELECT my_garage_ids()));
-- L'owner peut gérer les membres de son garage
CREATE POLICY "garage_users_owner_manage" ON garage_users FOR ALL TO authenticated
  USING (garage_id IN (
    SELECT garage_id FROM garage_users WHERE user_id = auth.uid() AND role = 'owner'
  ))
  WITH CHECK (garage_id IN (
    SELECT garage_id FROM garage_users WHERE user_id = auth.uid() AND role = 'owner'
  ));

-- ── VEHICLES ──
-- Lecture publique : véhicules disponibles ou réservés (pas "sold" masqué)
CREATE POLICY "vehicles_public_read" ON vehicles FOR SELECT
  USING (status IN ('available', 'reserved'));

-- Lecture complète pour les membres d'un garage lié
CREATE POLICY "vehicles_member_read_all" ON vehicles FOR SELECT TO authenticated
  USING (
    id IN (SELECT vehicle_id FROM garage_vehicles WHERE garage_id IN (SELECT my_garage_ids()))
  );

-- Un editor/owner peut créer un véhicule (associé à son garage via garage_vehicles)
CREATE POLICY "vehicles_editor_insert" ON vehicles FOR INSERT TO authenticated
  WITH CHECK (true);  -- la contrainte métier est dans garage_vehicles

-- Un editor/owner peut modifier SEULEMENT les véhicules de son garage
CREATE POLICY "vehicles_editor_update" ON vehicles FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT vehicle_id FROM garage_vehicles
      WHERE garage_id IN (SELECT my_garage_ids())
    )
    AND can_edit_garage(
      (SELECT garage_id FROM garage_vehicles WHERE vehicle_id = id
       AND garage_id IN (SELECT my_garage_ids()) LIMIT 1)
    )
  );

-- Suppression : owner uniquement
CREATE POLICY "vehicles_owner_delete" ON vehicles FOR DELETE TO authenticated
  USING (
    id IN (
      SELECT vehicle_id FROM garage_vehicles
      WHERE garage_id IN (
        SELECT garage_id FROM garage_users WHERE user_id = auth.uid() AND role = 'owner'
      )
    )
  );

-- ── GARAGE_VEHICLES ──
CREATE POLICY "garage_vehicles_public_read" ON garage_vehicles FOR SELECT
  USING (is_visible = true);

CREATE POLICY "garage_vehicles_editor_manage" ON garage_vehicles FOR ALL TO authenticated
  USING (can_edit_garage(garage_id))
  WITH CHECK (can_edit_garage(garage_id));

-- ── MESSAGES ──
CREATE POLICY "messages_public_insert" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_member_read"   ON messages FOR SELECT TO authenticated
  USING (garage_id IN (SELECT my_garage_ids()));
CREATE POLICY "messages_member_update" ON messages FOR UPDATE TO authenticated
  USING (garage_id IN (SELECT my_garage_ids()));

-- ────────────────────────────────────────────────────────────
--  9. VUE — véhicules d'un garage (public)
-- ────────────────────────────────────────────────────────────
CREATE VIEW garage_vehicle_view AS
SELECT
  v.*,
  gv.garage_id,
  gv.display_order,
  gv.is_visible,
  g.slug  AS garage_slug,
  g.name  AS garage_name
FROM vehicles v
JOIN garage_vehicles gv ON gv.vehicle_id = v.id
JOIN garages g ON g.id = gv.garage_id
WHERE gv.is_visible = true
  AND v.status IN ('available', 'reserved');

-- ────────────────────────────────────────────────────────────
--  10. DONNÉES INITIALES
-- ────────────────────────────────────────────────────────────
INSERT INTO garages (name, slug, address, city, postal_code, phone, email)
VALUES (
  'Garage Auto Mendonca',
  'mendonca-dremil-lafage',
  '6 Avenue de la Mouyssaguese',
  'Drémil-Lafage', '31280',
  '0532002038',
  'contact@garagemendonca.com'
);

-- ────────────────────────────────────────────────────────────
--  SUPABASE STORAGE — stratégie images
--
--  Bucket : "vehicle-images" (public, CDN activé)
--
--  Structure :
--    vehicle-images/
--      {vehicle_id}/
--        main.webp            ← image principale (index 0 du tableau)
--        gallery/
--          001.webp           ← images secondaires (numérotées)
--          002.webp
--          ...
--
--  Nommage :
--    - Toujours WebP (compression optimale)
--    - main.webp = thumbnail principal, résolution ≥ 1200×800
--    - gallery/NNN.webp = séquence numérotée à 3 chiffres
--    - Ne pas inclure de métadonnées dans le nom de fichier
--
--  URL publique :
--    https://{project}.supabase.co/storage/v1/object/public/vehicle-images/{vehicle_id}/main.webp
--
--  Resize automatique (Supabase Image Transformation) :
--    ?width=400&height=300&resize=cover   → card thumbnail
--    ?width=1200&height=800&resize=cover  → full view
--
--  Workflow upload Next.js :
--    1. Créer le véhicule → récupérer son UUID
--    2. Upload main.webp : storage.upload(`${id}/main.webp`, file)
--    3. Upload gallery  : storage.upload(`${id}/gallery/001.webp`, file)
--    4. Stocker les URLs dans vehicles.images[] et vehicles.thumbnail_url
--
--  Suppression propre :
--    storage.list(`${id}/`) → supprimer tous les fichiers → DELETE FROM vehicles
-- ────────────────────────────────────────────────────────────
