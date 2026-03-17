-- ============================================================
--  Garage Auto Mendonça — Supabase Schema
--  Compatible PostgreSQL / Supabase
--  Stratégie : simple, scalable, multi-garage-ready
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
--  1. GARAGES
--     Un garage = une entité physique (un second garage peut
--     être ajouté sans modifier le schéma)
-- ────────────────────────────────────────────────────────────
CREATE TABLE garages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,          -- ex: "mendonca-dremil"
  address      TEXT,
  city         TEXT,
  postal_code  TEXT,
  phone        TEXT,
  email        TEXT,
  logo_url     TEXT,                          -- Supabase Storage URL
  description  TEXT,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
--  2. VEHICLES
--     Les véhicules sont indépendants des garages.
--     Un véhicule peut appartenir à plusieurs garages via
--     garage_vehicles (pivot).
--
--     Choix techniques :
--     - images TEXT[]      → tableau de Supabase Storage URLs
--     - features JSONB     → champs dynamiques par véhicule
--       ex: {"Finition": "Acenta", "Motorisation": "1.4 88ch"}
--     - Pas de table séparée pour les carburants, boîtes, couleurs
--       → enum-like CHECK + JSONB pour le reste
-- ────────────────────────────────────────────────────────────
CREATE TABLE vehicles (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand          TEXT NOT NULL,
  model          TEXT NOT NULL,
  year           SMALLINT NOT NULL CHECK (year >= 1900 AND year <= 2100),
  mileage        INTEGER NOT NULL CHECK (mileage >= 0),
  fuel           TEXT NOT NULL CHECK (fuel IN ('Essence','Diesel','Hybride','Électrique','GPL','Hydrogène')),
  transmission   TEXT NOT NULL CHECK (transmission IN ('Manuelle','Automatique')),
  power          SMALLINT NOT NULL CHECK (power > 0),   -- en chevaux (ch)
  color          TEXT,
  doors          SMALLINT DEFAULT 5,
  price          INTEGER NOT NULL CHECK (price >= 0),   -- en euros TTC
  crit_air       TEXT,                                  -- '1','2','3','4','5','E'
  description    TEXT,
  images         TEXT[] DEFAULT '{}',                   -- Supabase Storage URLs
  features       JSONB DEFAULT '{}',                    -- champs dynamiques libres
  is_available   BOOLEAN DEFAULT true,
  featured       BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
--  3. GARAGE_VEHICLES (pivot)
--     Associe un véhicule à un (ou plusieurs) garage(s).
--     Chaque garage contrôle la visibilité et l'ordre d'affichage.
-- ────────────────────────────────────────────────────────────
CREATE TABLE garage_vehicles (
  garage_id      UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  vehicle_id     UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  display_order  INTEGER DEFAULT 0,       -- ordre d'affichage dans ce garage
  is_visible     BOOLEAN DEFAULT true,    -- ce garage peut masquer un véhicule
  added_at       TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (garage_id, vehicle_id)
);

-- ────────────────────────────────────────────────────────────
--  4. MESSAGES
--     Formulaire de contact lié optionnellement à un véhicule
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
--  5. INDEX (performance)
-- ────────────────────────────────────────────────────────────

-- Filtres fréquents sur vehicles
CREATE INDEX idx_vehicles_brand        ON vehicles(brand);
CREATE INDEX idx_vehicles_fuel         ON vehicles(fuel);
CREATE INDEX idx_vehicles_price        ON vehicles(price);
CREATE INDEX idx_vehicles_mileage      ON vehicles(mileage);
CREATE INDEX idx_vehicles_year         ON vehicles(year);
CREATE INDEX idx_vehicles_is_available ON vehicles(is_available);
CREATE INDEX idx_vehicles_featured     ON vehicles(featured);

-- JSONB GIN index pour requêtes sur features
-- ex: WHERE features->>'Finition' = 'Acenta'
CREATE INDEX idx_vehicles_features ON vehicles USING GIN (features);

-- Pivot
CREATE INDEX idx_garage_vehicles_garage  ON garage_vehicles(garage_id);
CREATE INDEX idx_garage_vehicles_vehicle ON garage_vehicles(vehicle_id);

-- Messages
CREATE INDEX idx_messages_garage  ON messages(garage_id);
CREATE INDEX idx_messages_vehicle ON messages(vehicle_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- ────────────────────────────────────────────────────────────
--  6. TRIGGER updated_at automatique
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_garages_updated_at
  BEFORE UPDATE ON garages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ────────────────────────────────────────────────────────────
--  7. DONNÉES INITIALES — garage Mendonça
-- ────────────────────────────────────────────────────────────
INSERT INTO garages (name, slug, address, city, postal_code, phone, email)
VALUES (
  'Garage Auto Mendonça',
  'mendonca-dremil-lafage',
  '6 Avenue de la Mouyssaguese',
  'Drémil-Lafage',
  '31280',
  '0532002038',
  'contact@garagemendonca.com'
);

-- ────────────────────────────────────────────────────────────
--  8. ROW LEVEL SECURITY (Supabase)
--     Lecture publique des véhicules disponibles.
--     Écriture réservée aux rôles authentifiés (admin).
-- ────────────────────────────────────────────────────────────
ALTER TABLE vehicles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE garages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;

-- Lecture publique : véhicules disponibles
CREATE POLICY "vehicles_public_read"
  ON vehicles FOR SELECT
  USING (is_available = true);

-- Lecture complète pour les admins (rôle authenticated)
CREATE POLICY "vehicles_admin_all"
  ON vehicles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Lecture publique : garages actifs
CREATE POLICY "garages_public_read"
  ON garages FOR SELECT
  USING (is_active = true);

CREATE POLICY "garages_admin_all"
  ON garages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Lecture publique : pivot garage_vehicles (véhicules visibles)
CREATE POLICY "garage_vehicles_public_read"
  ON garage_vehicles FOR SELECT
  USING (is_visible = true);

CREATE POLICY "garage_vehicles_admin_all"
  ON garage_vehicles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Messages : insertion publique, lecture admin uniquement
CREATE POLICY "messages_public_insert"
  ON messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "messages_admin_read"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "messages_admin_update"
  ON messages FOR UPDATE
  TO authenticated
  USING (true);

-- ────────────────────────────────────────────────────────────
--  9. VUE UTILE — véhicules d'un garage (jointure simplifiée)
--     Usage Next.js : supabase.from("garage_vehicle_view")
--       .select("*").eq("garage_slug", "mendonca-dremil-lafage")
-- ────────────────────────────────────────────────────────────
CREATE VIEW garage_vehicle_view AS
SELECT
  v.*,
  gv.garage_id,
  gv.display_order,
  gv.is_visible,
  g.slug AS garage_slug,
  g.name AS garage_name
FROM vehicles v
JOIN garage_vehicles gv ON gv.vehicle_id = v.id
JOIN garages g ON g.id = gv.garage_id
WHERE gv.is_visible = true AND v.is_available = true;

-- ────────────────────────────────────────────────────────────
--  BONUS — Supabase Storage : stratégie images
--
--  Bucket : "vehicle-images" (public)
--  Structure : vehicle-images/{vehicle_id}/{filename}.webp
--
--  Avantages :
--  - URL stable même si le véhicule est modifié
--  - Suppression groupée possible par vehicle_id
--  - CDN Supabase automatique (transform, resize)
--
--  Exemple Next.js upload :
--    const { data } = await supabase.storage
--      .from("vehicle-images")
--      .upload(`${vehicleId}/${Date.now()}.webp`, file);
--    const url = supabase.storage.from("vehicle-images").getPublicUrl(data.path).data.publicUrl;
--    // Puis : UPDATE vehicles SET images = array_append(images, url) WHERE id = vehicleId
-- ────────────────────────────────────────────────────────────
