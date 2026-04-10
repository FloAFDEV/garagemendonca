-- ═══════════════════════════════════════════════════════════════
--  Garage Auto Mendonça — Schéma Supabase (PostgreSQL)
--  Architecture multi-garages — v2
--  Aligné avec types/index.ts (VehicleStatus, Vehicle, Garage…)
-- ═══════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Types ENUM ──────────────────────────────────────────────────

-- Miroir de VehicleStatus dans types/index.ts
-- draft      → brouillon, non visible côté public
-- published  → visible immédiatement
-- scheduled  → visible à partir de published_at
-- sold       → reste visible avec badge "Vendu"
create type vehicle_status as enum ('draft', 'published', 'scheduled', 'sold');

-- Miroir de UserRole dans types/index.ts
create type user_role as enum ('superadmin', 'admin', 'staff');

-- Miroir de GaragePlan dans types/index.ts
create type garage_plan as enum ('isolated', 'shared');

-- Types de carburant (miroir Vehicle.fuel)
create type fuel_type as enum ('Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL', 'Hydrogène');

-- Types de transmission (miroir Vehicle.transmission)
create type transmission_type as enum ('Manuelle', 'Automatique');

-- ── Table : garages ─────────────────────────────────────────────
-- Miroir de l'interface Garage dans types/index.ts
create table garages (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,                       -- "Garage Auto Mendonça"
  slug        text not null unique,                -- "garage-mendonca" (URL-safe)
  address     text,                                -- "6 Avenue de la Mouyssaguese, 31280 Drémil-Lafage"
  phone       text,                                -- "05 32 00 20 38"
  email       text,                                -- "contact@garagemendonca.com"
  plan        garage_plan not null default 'isolated',
  created_at  timestamptz not null default now(),  -- → Garage.createdAt
  updated_at  timestamptz not null default now()   -- → Garage.updatedAt
);

-- ── Table : vehicles ────────────────────────────────────────────
-- Miroir de l'interface Vehicle dans types/index.ts
create table vehicles (
  id              uuid primary key default uuid_generate_v4(),   -- Vehicle.id
  garage_id       uuid not null references garages(id) on delete cascade, -- Vehicle.garageId

  -- Caractéristiques principales
  brand           text not null,                                 -- Vehicle.brand
  model           text not null,                                 -- Vehicle.model
  year            integer not null check (year between 1900 and 2100), -- Vehicle.year
  mileage         integer not null check (mileage >= 0),         -- Vehicle.mileage
  fuel            fuel_type not null,                            -- Vehicle.fuel
  transmission    transmission_type not null,                    -- Vehicle.transmission
  power           integer check (power >= 0),                    -- Vehicle.power
  price           integer not null check (price >= 0),           -- Vehicle.price
  color           text not null,                                 -- Vehicle.color
  doors           integer default 5 check (doors in (2, 3, 4, 5)), -- Vehicle.doors
  crit_air        text,                                          -- Vehicle.critAir

  description     text,                                          -- Vehicle.description

  -- Médias
  images          text[] default '{}',                           -- Vehicle.images (tableau URLs)
  thumbnail_url   text,                                          -- Vehicle.thumbnailUrl (cache)

  -- Statut métier (miroir VehicleStatus)
  status          vehicle_status not null default 'draft',       -- Vehicle.status

  -- Publication programmée — renseignée quand status = 'scheduled'
  published_at    timestamptz,                                   -- Vehicle.published_at

  -- Date de vente — renseignée quand status = 'sold'
  sold_at         timestamptz,                                   -- Vehicle.sold_at

  -- Mise en avant (homepage)
  featured        boolean not null default false,                -- Vehicle.featured
  featured_order  integer,                                       -- Vehicle.featuredOrder (1 = premier)

  -- Caractéristiques structurées (miroir VehicleFeatures)
  -- Structure JSONB recommandée :
  -- {
  --   "Finition"          : "Acenta",
  --   "Motorisation"      : "1.4 88 ch",
  --   "Provenance"        : "Française",
  --   "nbProprietaires"   : "1",
  --   "carnetEntretien"   : "À jour",
  --   "controleTechnique" : "À jour",
  --   "garantie"          : "6 à 12 mois km illimités",
  --   "Options"           : ["Toit ouvrant", "Clim auto", "Bluetooth"]
  -- }
  features        jsonb default '{}',                            -- Vehicle.features

  -- Options équipement structurées (miroir VehicleOptions dans types/index.ts)
  -- Toutes les clés sont optionnelles (boolean). Exemples :
  -- {
  --   "climatisation_automatique": true,
  --   "toit_panoramique": true,
  --   "camera_recul": true,
  --   "bluetooth": true
  -- }
  options         jsonb default '{}',                            -- Vehicle.options

  -- Timestamps (camelCase côté TS, snake_case en base)
  created_at      timestamptz not null default now(),            -- Vehicle.createdAt
  updated_at      timestamptz not null default now()             -- Vehicle.updatedAt
);

-- ── Table : garage_users ────────────────────────────────────────
-- Miroir de l'interface GarageUser dans types/index.ts
create table garage_users (
  id          uuid primary key default uuid_generate_v4(),       -- GarageUser.id
  garage_id   uuid not null references garages(id) on delete cascade, -- GarageUser.garageId
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        user_role not null default 'staff',                -- GarageUser.role
  created_at  timestamptz not null default now(),                -- GarageUser.createdAt
  unique (garage_id, user_id)
);

-- ── Trigger : updated_at automatique ────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_vehicles_updated_at
  before update on vehicles
  for each row execute function set_updated_at();

create trigger trg_garages_updated_at
  before update on garages
  for each row execute function set_updated_at();

-- ── Index — performance filtres & tris ──────────────────────────
create index idx_vehicles_garage_id    on vehicles(garage_id);
create index idx_vehicles_status       on vehicles(status);
create index idx_vehicles_featured     on vehicles(featured) where featured = true;
create index idx_vehicles_status_price on vehicles(status, price);
create index idx_vehicles_status_km    on vehicles(status, mileage);
create index idx_vehicles_brand        on vehicles(brand);
create index idx_vehicles_fuel         on vehicles(fuel);
create index idx_vehicles_year         on vehicles(year desc);
create index idx_vehicles_created_at   on vehicles(created_at desc);
-- Requêtes scheduled : WHERE status = 'scheduled' AND published_at <= now()
create index idx_vehicles_published_at on vehicles(published_at) where status = 'scheduled';
-- GIN sur features JSONB pour recherches sur clés libres
create index idx_vehicles_features     on vehicles using gin(features);
-- GIN sur options JSONB pour filtrage par équipement (ex: options @> '{"toit_panoramique":true}')
create index idx_vehicles_options      on vehicles using gin(options);

-- ── Row Level Security (RLS) ────────────────────────────────────
alter table garages       enable row level security;
alter table vehicles      enable row level security;
alter table garage_users  enable row level security;

-- ── Lecture publique : véhicules publiés ou vendus ──
-- Logique : miroir de isPubliclyVisible() dans lib/vehicles.ts
create policy "vehicles_public_read"
  on vehicles for select
  using (
    status = 'published'
    or status = 'sold'
    or (status = 'scheduled' and published_at <= now())
  );

-- ── Lecture complète pour les membres du garage ──
create policy "vehicles_garage_member_read"
  on vehicles for select to authenticated
  using (
    garage_id in (
      select gu.garage_id from garage_users gu
      where gu.user_id = auth.uid()
    )
    or
    garage_id in (
      select g.id from garages g
      where g.plan = 'shared'
    )
  );

-- ── Écriture : admin/superadmin uniquement ──
create policy "vehicles_write_own_garage"
  on vehicles for all to authenticated
  using (
    garage_id in (
      select gu.garage_id from garage_users gu
      where gu.user_id = auth.uid()
      and gu.role in ('admin', 'superadmin')
    )
  );

-- ── Garages : lecture publique ──
create policy "garages_public_read"
  on garages for select
  using (true);

-- ── Données de démo ─────────────────────────────────────────────
insert into garages (id, name, slug, address, phone, email, plan) values
  (
    '00000000-0000-0000-0000-000000000001',
    'Garage Auto Mendonça',
    'garage-mendonca',
    '6 Avenue de la Mouyssaguese, 31280 Drémil-Lafage',
    '05 32 00 20 38',
    'contact@garagemendonca.com',
    'isolated'
  );

-- ═══════════════════════════════════════════════════════════════
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
--
--  Nommage : toujours .webp, résolution ≥ 1200×800 pour main
--
--  URL publique :
--    https://{project}.supabase.co/storage/v1/object/public/vehicle-images/{id}/main.webp
--
--  Resize automatique (Supabase Image Transformation) :
--    ?width=400&height=300&resize=cover   → card thumbnail
--    ?width=1200&height=800&resize=cover  → full view
--
--  Workflow upload Next.js :
--    1. Créer le véhicule → récupérer son UUID
--    2. Upload : storage.upload(`${id}/main.webp`, file)
--    3. Stocker URL dans vehicles.thumbnail_url et vehicles.images[0]
--
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
--  MIGRATION depuis données mock (lib/data.ts)
--
--  Correspondance camelCase ↔ snake_case :
--    Vehicle.garageId      → vehicles.garage_id
--    Vehicle.critAir       → vehicles.crit_air
--    Vehicle.thumbnailUrl  → vehicles.thumbnail_url
--    Vehicle.featuredOrder → vehicles.featured_order
--    Vehicle.published_at  → vehicles.published_at  (déjà snake_case)
--    Vehicle.sold_at       → vehicles.sold_at        (déjà snake_case)
--    Vehicle.createdAt     → vehicles.created_at
--    Vehicle.updatedAt     → vehicles.updated_at
--    Vehicle.options       → vehicles.options      (JSONB, miroir VehicleOptions)
--
--  Côté Next.js, lib/vehicles.ts lit/écrit en camelCase.
--  Le client Supabase renvoie du snake_case → mapper via un helper :
--
--    function mapVehicle(row: any): Vehicle {
--      return {
--        ...row,
--        garageId:      row.garage_id,
--        critAir:       row.crit_air,
--        thumbnailUrl:  row.thumbnail_url,
--        featuredOrder: row.featured_order,
--        published_at:  row.published_at,
--        sold_at:       row.sold_at,
--        createdAt:     row.created_at,
--        updatedAt:     row.updated_at,
--      };
--    }
--
-- ═══════════════════════════════════════════════════════════════
