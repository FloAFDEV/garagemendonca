-- ═══════════════════════════════════════════════════════════════
--  Garage Auto Mendonça — Schéma Supabase (PostgreSQL)
--  Architecture multi-garages — v3
--  Aligné avec types/index.ts (VehicleStatus, Vehicle, Garage…)
--
--  Exécuter dans : Supabase Dashboard > SQL Editor
--  Ordre d'exécution : ce fichier est autonome (une seule passe).
-- ═══════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Types ENUM ──────────────────────────────────────────────────

-- Miroir de VehicleStatus dans types/index.ts
create type vehicle_status as enum ('draft', 'published', 'scheduled', 'sold');

-- Miroir de UserRole dans types/index.ts
create type user_role as enum ('superadmin', 'admin', 'staff');

-- Miroir de GaragePlan dans types/index.ts
create type garage_plan as enum ('isolated', 'shared');

-- Types de carburant (miroir Vehicle.fuel)
create type fuel_type as enum ('Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL', 'Hydrogène');

-- Types de transmission (miroir Vehicle.transmission)
create type transmission_type as enum ('Manuelle', 'Automatique');

-- ─────────────────────────────────────────────────────────────────
--  TABLE : garages
--  Miroir de l'interface Garage dans types/index.ts
-- ─────────────────────────────────────────────────────────────────
create table garages (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,                          -- Garage.name
  slug        text not null unique,                   -- Garage.slug (URL-safe)
  address     text,                                   -- Garage.address
  phone       text,                                   -- Garage.phone
  email       text,                                   -- Garage.email
  logo_url    text,                                   -- Garage.logo_url (Supabase Storage)
  description text,                                   -- Garage.description
  is_active   boolean not null default true,          -- Garage.is_active
  plan        garage_plan not null default 'isolated', -- Garage.plan
  created_at  timestamptz not null default now(),     -- Garage.createdAt
  updated_at  timestamptz not null default now()      -- Garage.updatedAt
);

-- ─────────────────────────────────────────────────────────────────
--  TABLE : garage_users
--  Miroir de l'interface GarageUser dans types/index.ts
-- ─────────────────────────────────────────────────────────────────
create table garage_users (
  id          uuid primary key default uuid_generate_v4(),
  garage_id   uuid not null references garages(id) on delete cascade, -- GarageUser.garageId
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        user_role not null default 'staff',     -- GarageUser.role
  created_at  timestamptz not null default now(),     -- GarageUser.createdAt
  unique (garage_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────
--  TABLE : vehicle_categories
--  Catégories administrables depuis le dashboard (aucune valeur hardcodée)
--  Miroir de l'interface VehicleCategory dans types/index.ts
--
--  Exemples : voitures, utilitaires, deux-roues, bateaux, engins-agricoles
-- ─────────────────────────────────────────────────────────────────
create table vehicle_categories (
  id          uuid primary key default uuid_generate_v4(),
  garage_id   uuid not null references garages(id) on delete cascade,
  slug        text not null,           -- VehicleCategory.slug ex: "voitures"
  label       text not null,           -- VehicleCategory.label ex: "Voitures"
  icon        text,                    -- VehicleCategory.icon  ex: "car" ou "🚗"
  color       text,                    -- VehicleCategory.color ex: "#3b82f6"
  description text,                    -- VehicleCategory.description (usage admin)
  sort_order  smallint not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (garage_id, slug)
);

-- ─────────────────────────────────────────────────────────────────
--  TABLE : vehicles
--  Miroir de l'interface Vehicle dans types/index.ts
-- ─────────────────────────────────────────────────────────────────
create table vehicles (
  id              uuid primary key default uuid_generate_v4(),
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
  images          text[] default '{}',                           -- Vehicle.images
  thumbnail_url   text,                                          -- Vehicle.thumbnailUrl

  -- Statut métier
  status          vehicle_status not null default 'draft',       -- Vehicle.status
  published_at    timestamptz,                                   -- Vehicle.published_at
  sold_at         timestamptz,                                   -- Vehicle.sold_at

  -- Mise en avant
  featured        boolean not null default false,                -- Vehicle.featured
  featured_order  integer,                                       -- Vehicle.featuredOrder

  -- Classification dynamique (slugs des vehicle_categories)
  -- Requête filtre : WHERE categories @> ARRAY['voitures']
  categories      text[] default '{}',                           -- Vehicle.categories

  -- Caractéristiques structurées (JSONB) — Vehicle.features
  features        jsonb default '{}',

  -- Options équipement (JSONB ~84 booléens) — Vehicle.options
  options         jsonb default '{}',

  created_at      timestamptz not null default now(),            -- Vehicle.createdAt
  updated_at      timestamptz not null default now()             -- Vehicle.updatedAt
);

-- ─────────────────────────────────────────────────────────────────
--  TABLE : services
--  Miroir de l'interface Service dans types/index.ts
-- ─────────────────────────────────────────────────────────────────
create table services (
  id                uuid primary key default uuid_generate_v4(),
  garage_id         uuid not null references garages(id) on delete cascade,
  slug              text not null,       -- Service.slug ex: "mecanique"
  sort_order        integer default 0,   -- Service.order
  title             text not null,       -- Service.title
  icon              text not null,       -- Service.icon
  short_description text not null,       -- Service.short_description
  long_description  text not null,       -- Service.long_description
  features          text[] default '{}', -- Service.features
  -- Données imbriquées stockées en JSONB (schéma évolutif, rarement filtrées)
  steps             jsonb default '[]',  -- Service.steps (ServiceStep[])
  pricing           jsonb default '[]',  -- Service.pricing (ServicePricing[])
  faq               jsonb default '[]',  -- Service.faq (ServiceFAQItem[])
  testimonials      jsonb default '[]',  -- Service.testimonials (ServiceTestimonial[])
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (garage_id, slug)
);

-- Images de service — table séparée pour permettre le réordonnancement
-- Miroir de l'interface ServiceImage dans types/index.ts
create table service_images (
  id         uuid primary key default uuid_generate_v4(),
  service_id uuid not null references services(id) on delete cascade, -- ServiceImage.service_id
  garage_id  uuid not null references garages(id) on delete cascade,  -- ServiceImage.garage_id
  url        text not null,           -- ServiceImage.url
  alt        text,                    -- ServiceImage.alt
  sort_order integer not null default 0, -- ServiceImage.order
  is_primary boolean not null default false -- ServiceImage.is_primary
);

-- ─────────────────────────────────────────────────────────────────
--  TABLE : banners
--  Miroir de l'interface Banner dans types/index.ts
--  Une bannière active par garage à la fois (enforced applicativement).
-- ─────────────────────────────────────────────────────────────────
create table banners (
  id              uuid primary key default uuid_generate_v4(),
  garage_id       uuid not null references garages(id) on delete cascade, -- Banner.garage_id
  is_active       boolean not null default false,  -- Banner.is_active
  message         text not null,                   -- Banner.message
  sub_message     text,                            -- Banner.sub_message
  image_url       text,                            -- Banner.image_url
  cta_label       text,                            -- Banner.cta_label
  cta_url         text,                            -- Banner.cta_url
  bg_color        text not null default '#c8102e', -- Banner.bg_color
  scheduled_start timestamptz,                     -- Banner.scheduled_start
  scheduled_end   timestamptz,                     -- Banner.scheduled_end
  display_pages   text not null default 'all' check (display_pages in ('all', 'home_only')),
  is_dismissible  boolean not null default true,   -- Banner.is_dismissible
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now() -- Banner.updated_at
);

-- ─────────────────────────────────────────────────────────────────
--  TRIGGER : updated_at automatique
-- ─────────────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_garages_updated_at
  before update on garages
  for each row execute function set_updated_at();

create trigger trg_vehicle_categories_updated_at
  before update on vehicle_categories
  for each row execute function set_updated_at();

create trigger trg_vehicles_updated_at
  before update on vehicles
  for each row execute function set_updated_at();

create trigger trg_services_updated_at
  before update on services
  for each row execute function set_updated_at();

create trigger trg_banners_updated_at
  before update on banners
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────────────────────────
--  INDEX — performance filtres & tris
-- ─────────────────────────────────────────────────────────────────

-- vehicles
create index idx_vehicles_garage_id    on vehicles(garage_id);
create index idx_vehicles_status       on vehicles(status);
create index idx_vehicles_featured     on vehicles(featured) where featured = true;
create index idx_vehicles_status_price on vehicles(status, price);
create index idx_vehicles_status_km    on vehicles(status, mileage);
create index idx_vehicles_brand        on vehicles(brand);
create index idx_vehicles_fuel         on vehicles(fuel);
create index idx_vehicles_year         on vehicles(year desc);
create index idx_vehicles_created_at   on vehicles(created_at desc);
-- WHERE status = 'scheduled' AND published_at <= now()
create index idx_vehicles_published_at on vehicles(published_at) where status = 'scheduled';
-- GIN : features JSONB (recherches sur clés libres)
create index idx_vehicles_features     on vehicles using gin(features);
-- GIN : options JSONB (~84 booléens équipement)
create index idx_vehicles_options      on vehicles using gin(options);
-- GIN : categories TEXT[] — filtre WHERE categories @> ARRAY['voitures']
create index idx_vehicles_categories   on vehicles using gin(categories);

-- vehicle_categories
create index idx_vc_garage_active on vehicle_categories(garage_id, is_active, sort_order);

-- services
create index idx_services_garage on services(garage_id, is_active, sort_order);

-- banners
create index idx_banners_garage_active on banners(garage_id, is_active);

-- garage_users
create index idx_gu_garage on garage_users(garage_id);
create index idx_gu_user   on garage_users(user_id);

-- ─────────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────
alter table garages            enable row level security;
alter table garage_users       enable row level security;
alter table vehicle_categories enable row level security;
alter table vehicles           enable row level security;
alter table services           enable row level security;
alter table service_images     enable row level security;
alter table banners            enable row level security;

-- ── Helper : garage_ids de l'utilisateur courant ──
create or replace function my_garage_ids()
returns setof uuid language sql stable security definer as $$
  select garage_id from garage_users where user_id = auth.uid();
$$;

-- ── Helper : est-ce que l'utilisateur peut écrire dans ce garage ? ──
create or replace function can_write_garage(gid uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from garage_users
    where garage_id = gid
      and user_id = auth.uid()
      and role in ('admin', 'superadmin')
  );
$$;

-- ── GARAGES ──
create policy "garages_public_read"
  on garages for select using (is_active = true);

create policy "garages_admin_write"
  on garages for all to authenticated
  using (can_write_garage(id));

-- ── GARAGE_USERS ──
create policy "gu_member_read"
  on garage_users for select to authenticated
  using (garage_id in (select my_garage_ids()));

create policy "gu_admin_write"
  on garage_users for all to authenticated
  using (
    garage_id in (
      select garage_id from garage_users
      where user_id = auth.uid() and role in ('admin', 'superadmin')
    )
  );

-- ── VEHICLE_CATEGORIES ──
create policy "vc_public_read"
  on vehicle_categories for select
  using (is_active = true);

create policy "vc_admin_write"
  on vehicle_categories for all to authenticated
  using (can_write_garage(garage_id))
  with check (can_write_garage(garage_id));

-- ── VEHICLES ──
-- Lecture publique : published, sold, ou scheduled dont la date est passée
create policy "vehicles_public_read"
  on vehicles for select
  using (
    status = 'published'
    or status = 'sold'
    or (status = 'scheduled' and published_at <= now())
  );

-- Lecture complète pour les membres du garage
create policy "vehicles_member_read_all"
  on vehicles for select to authenticated
  using (garage_id in (select my_garage_ids()));

-- Écriture : admin/superadmin du garage uniquement
create policy "vehicles_admin_write"
  on vehicles for all to authenticated
  using (can_write_garage(garage_id))
  with check (can_write_garage(garage_id));

-- ── SERVICES ──
create policy "services_public_read"
  on services for select using (is_active = true);

create policy "services_admin_write"
  on services for all to authenticated
  using (can_write_garage(garage_id))
  with check (can_write_garage(garage_id));

-- ── SERVICE_IMAGES ──
create policy "service_images_public_read"
  on service_images for select using (true);

create policy "service_images_admin_write"
  on service_images for all to authenticated
  using (can_write_garage(garage_id))
  with check (can_write_garage(garage_id));

-- ── BANNERS ──
-- Lecture publique : bannière active dont la planification est en cours
create policy "banners_public_read"
  on banners for select
  using (
    is_active = true
    and (scheduled_start is null or scheduled_start <= now())
    and (scheduled_end   is null or scheduled_end   >  now())
  );

create policy "banners_admin_write"
  on banners for all to authenticated
  using (can_write_garage(garage_id))
  with check (can_write_garage(garage_id));

-- ─────────────────────────────────────────────────────────────────
--  DONNÉES INITIALES
-- ─────────────────────────────────────────────────────────────────
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
--  Buckets :
--    "vehicle-images"  (public, CDN activé)
--    "service-images"  (public, CDN activé)
--    "garage-logos"    (public, CDN activé)
--
--  Structure vehicle-images :
--    {vehicle_id}/main.webp          ← thumbnail principal ≥ 1200×800
--    {vehicle_id}/gallery/001.webp   ← images secondaires numérotées
--
--  URL publique :
--    https://{project}.supabase.co/storage/v1/object/public/vehicle-images/{id}/main.webp
--
--  Resize automatique (Supabase Image Transformation) :
--    ?width=400&height=300&resize=cover   → card thumbnail
--    ?width=1200&height=800&resize=cover  → full view
--
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
--  MAPPING camelCase ↔ snake_case (côté Next.js)
--
--  Vehicle :
--    garageId      → garage_id
--    critAir       → crit_air
--    thumbnailUrl  → thumbnail_url
--    featuredOrder → featured_order
--    published_at  → published_at   (déjà snake_case)
--    sold_at       → sold_at         (déjà snake_case)
--    createdAt     → created_at
--    updatedAt     → updated_at
--
--  Garage :
--    logo_url      → logo_url       (déjà snake_case)
--    is_active     → is_active      (déjà snake_case)
--    createdAt     → created_at
--    updatedAt     → updated_at
--
--  Helpers de mapping dans lib/vehicles.ts :
--    function mapVehicle(row): Vehicle { ... }
--    function mapGarage(row): Garage { ... }
--
-- ═══════════════════════════════════════════════════════════════
