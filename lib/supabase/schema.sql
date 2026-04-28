-- ═══════════════════════════════════════════════════════════════
--  Garage Auto Mendonca — Schéma Supabase (PostgreSQL)
--  Architecture multi-garages — v4
--  Aligné avec types/index.ts (VehicleStatus, Vehicle, Garage…)
--
--  Exécuter dans : Supabase Dashboard > SQL Editor
--  Ordre d'exécution : ce fichier est autonome (une seule passe).
--
--  Historique :
--    v2 → enums, garages, vehicles, garage_users, RLS de base
--    v3 → vehicle_categories, services, service_images, banners,
--          options JSONB, categories TEXT[], triggers updated_at
--    v4 → messages (leads), vehicle_images, SEO vehicles (slug,
--          meta_description), export leboncoin, SEO garages
--          (city, postal_code, lat, lng, google_maps_url, opening_hours)
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
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,                          -- Garage.name
  slug            text not null unique,                   -- Garage.slug (URL-safe)
  address         text,                                   -- Garage.address
  phone           text,                                   -- Garage.phone
  email           text,                                   -- Garage.email
  logo_url        text,                                   -- Garage.logo_url (Supabase Storage)
  description     text,                                   -- Garage.description
  is_active       boolean not null default true,          -- Garage.is_active
  plan            garage_plan not null default 'isolated', -- Garage.plan

  -- ── SEO local (v4) ───────────────────────────────────────────
  city            text,                                   -- Garage.city
  postal_code     text,                                   -- Garage.postal_code
  lat             numeric(9,6),                           -- Garage.lat  ex: 43.604652
  lng             numeric(9,6),                           -- Garage.lng  ex: 1.444209
  google_maps_url text,                                   -- Garage.google_maps_url
  -- Horaires JSONB :
  -- {
  --   "lundi":    {"open": "08:00", "close": "19:00"},
  --   "vendredi": {"open": "08:00", "close": "18:00"},
  --   "samedi":   null,
  --   "dimanche": null
  -- }
  opening_hours   jsonb default '{}',                     -- Garage.opening_hours

  created_at      timestamptz not null default now(),     -- Garage.createdAt
  updated_at      timestamptz not null default now()      -- Garage.updatedAt
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
  slug        text not null,           -- VehicleCategory.slug  ex: "voitures"
  label       text not null,           -- VehicleCategory.label ex: "Voitures"
  icon        text,                    -- VehicleCategory.icon  ex: "car" ou "🚗"
  color       text,                    -- VehicleCategory.color ex: "#3b82f6"
  description text,                    -- VehicleCategory.description (usage admin)
  sort_order  smallint not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  CONSTRAINT uniq_category_slug_per_garage UNIQUE (garage_id, slug)
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
  images          text[] default '{}',                           -- Vehicle.images (URLs legacy)
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

  -- ── SEO (v4) ─────────────────────────────────────────────────
  -- Slug unique par garage, ex: "peugeot-208-automatique-2021"
  -- Utilisé pour les URLs SEO : /vehicules/{slug}
  -- nullable intentionnel : la génération du slug est applicative (lib/vehicles.ts).
  -- Passage en NOT NULL possible une fois que createVehicle() génère le slug
  -- et qu'une migration backfill a été exécutée sur les véhicules existants.
  slug            text,                                          -- Vehicle.slug
  meta_description text,                                         -- Vehicle.meta_description

  -- ── Export portails (v4) ─────────────────────────────────────
  export_leboncoin boolean not null default false,               -- Vehicle.export_leboncoin
  external_id     text,                                          -- Vehicle.external_id

  created_at      timestamptz not null default now(),            -- Vehicle.createdAt
  updated_at      timestamptz not null default now()             -- Vehicle.updatedAt
);

-- ─────────────────────────────────────────────────────────────────
--  TABLE : vehicle_images (v4)
--  Images indexées d'un véhicule — remplace progressivement vehicles.images[]
--  Miroir de l'interface VehicleImage dans types/index.ts
-- ─────────────────────────────────────────────────────────────────
create table vehicle_images (
  id          uuid primary key default uuid_generate_v4(),
  vehicle_id  uuid not null references vehicles(id) on delete cascade, -- VehicleImage.vehicle_id
  garage_id   uuid not null references garages(id) on delete cascade,  -- VehicleImage.garage_id
  url         text not null,                  -- VehicleImage.url (Supabase Storage URL)
  alt         text,                           -- VehicleImage.alt (texte alternatif SEO)
  sort_order  integer not null default 0,     -- VehicleImage.sort_order (0 = première)
  is_primary  boolean not null default false, -- VehicleImage.is_primary
  created_at  timestamptz not null default now()
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
  -- Données imbriquées JSONB (schéma évolutif, rarement filtrées)
  steps             jsonb default '[]',  -- Service.steps       (ServiceStep[])
  pricing           jsonb default '[]',  -- Service.pricing     (ServicePricing[])
  faq               jsonb default '[]',  -- Service.faq         (ServiceFAQItem[])
  testimonials      jsonb default '[]',  -- Service.testimonials (ServiceTestimonial[])
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  CONSTRAINT uniq_service_slug_per_garage UNIQUE (garage_id, slug)
);

-- Images de service — table séparée pour le réordonnancement
-- Miroir de l'interface ServiceImage dans types/index.ts
create table service_images (
  id         uuid primary key default uuid_generate_v4(),
  service_id uuid not null references services(id) on delete cascade, -- ServiceImage.service_id
  garage_id  uuid not null references garages(id) on delete cascade,  -- ServiceImage.garage_id
  url        text not null,                    -- ServiceImage.url
  alt        text,                             -- ServiceImage.alt
  sort_order integer not null default 0,       -- ServiceImage.order
  is_primary boolean not null default false    -- ServiceImage.is_primary
);

-- ─────────────────────────────────────────────────────────────────
--  TABLE : banners
--  Miroir de l'interface Banner dans types/index.ts
--  Une bannière active par garage à la fois (enforced applicativement).
-- ─────────────────────────────────────────────────────────────────
create table banners (
  id              uuid primary key default uuid_generate_v4(),
  garage_id       uuid not null references garages(id) on delete cascade,
  is_active       boolean not null default false,
  message         text not null,
  sub_message     text,
  image_url       text,
  cta_label       text,
  cta_url         text,
  bg_color        text not null default '#c8102e',
  scheduled_start timestamptz,
  scheduled_end   timestamptz,
  display_pages   text not null default 'all' check (display_pages in ('all', 'home_only')),
  is_dismissible  boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────
--  TABLE : messages (v4)
--  Leads et demandes de contact reçus via le formulaire.
--  Miroir de l'interface Message dans types/index.ts
-- ─────────────────────────────────────────────────────────────────
create table messages (
  id          uuid primary key default uuid_generate_v4(),
  -- Liens contextuels (optionnels)
  garage_id   uuid references garages(id) on delete set null,  -- Message.garage_id
  vehicle_id  uuid references vehicles(id) on delete set null, -- Message.vehicle_id (lead fiche VO)

  -- Corps du message
  name        text not null,   -- Message.name
  email       text not null,   -- Message.email
  phone       text,            -- Message.phone
  subject     text,            -- Message.subject
  message     text not null,   -- Message.message

  -- Suivi lecture : null = non lu | timestamptz = lu le ...
  read_at     timestamptz,     -- Message.read_at

  -- Statut admin simple : new → read → archived
  status      text not null default 'new'
                check (status in ('new', 'read', 'archived')),

  created_at  timestamptz not null default now()
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
--  TRIGGER : cohérence vehicle_images (garage_id ↔ vehicle_id)
--  Garantit qu'une image appartient bien au garage du véhicule référencé.
-- ─────────────────────────────────────────────────────────────────
create or replace function check_vehicle_image_garage()
returns trigger as $$
begin
  if not exists (
    select 1 from vehicles v
    where v.id = new.vehicle_id
      and v.garage_id = new.garage_id
  ) then
    raise exception 'vehicle_image: vehicle_id and garage_id mismatch';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_vehicle_image_garage
  before insert or update on vehicle_images
  for each row execute function check_vehicle_image_garage();

-- ─────────────────────────────────────────────────────────────────
--  INDEX — performance filtres & tris
-- ─────────────────────────────────────────────────────────────────
-- Note : les UNIQUE CONSTRAINT inline (uniq_category_slug_per_garage,
-- uniq_service_slug_per_garage) créent implicitement des index B-tree.
-- Le slug véhicule utilise un index CI fonctionnel (voir ci-dessous).

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
create index idx_vehicles_published_at on vehicles(published_at) where status = 'scheduled';
create index idx_vehicles_features     on vehicles using gin(features);
create index idx_vehicles_options      on vehicles using gin(options);
create index idx_vehicles_categories   on vehicles using gin(categories);
-- Slug SEO : unicité case-insensitive + lookup /vehicules/{slug}
-- Index fonctionnel sur lower(slug) pour rejeter "Peugeot-208" si "peugeot-208" existe.
-- Partial (WHERE slug IS NOT NULL) : les véhicules sans slug ne sont pas indexés.
create unique index uniq_vehicle_slug_per_garage_ci
  on vehicles (garage_id, lower(slug))
  where slug is not null;
-- Export portails (filtre rapide sur les véhicules à exporter)
create index idx_vehicles_export       on vehicles(garage_id, export_leboncoin)
  where export_leboncoin = true;

-- vehicle_images
create index idx_vehicle_images_vehicle on vehicle_images(vehicle_id, sort_order);
create index idx_vehicle_images_garage  on vehicle_images(garage_id);
-- Contrainte : une seule image principale par véhicule (partial unique index)
create unique index uniq_primary_image_per_vehicle
  on vehicle_images (vehicle_id)
  where is_primary = true;

-- vehicle_categories
create index idx_vc_garage_active on vehicle_categories(garage_id, is_active, sort_order);

-- services
create index idx_services_garage on services(garage_id, is_active, sort_order);

-- banners
create index idx_banners_garage_active on banners(garage_id, is_active);

-- messages
-- Boîte de réception : messages non lus d'un garage (usage dashboard)
create index idx_messages_garage_unread on messages(garage_id, read_at)
  where read_at is null;
-- Leads liés à un véhicule précis
create index idx_messages_vehicle  on messages(vehicle_id)
  where vehicle_id is not null;
-- Tri chronologique
create index idx_messages_created  on messages(created_at desc);

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
alter table vehicle_images     enable row level security;
alter table services           enable row level security;
alter table service_images     enable row level security;
alter table banners            enable row level security;
alter table messages           enable row level security;

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
create policy "vehicles_public_read"
  on vehicles for select
  using (
    status = 'published'
    or status = 'sold'
    or (status = 'scheduled' and published_at <= now())
  );

create policy "vehicles_member_read_all"
  on vehicles for select to authenticated
  using (garage_id in (select my_garage_ids()));

create policy "vehicles_admin_write"
  on vehicles for all to authenticated
  using (can_write_garage(garage_id))
  with check (can_write_garage(garage_id));

-- ── VEHICLE_IMAGES ──
create policy "vehicle_images_public_read"
  on vehicle_images for select using (true);

create policy "vehicle_images_admin_write"
  on vehicle_images for all to authenticated
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

-- ── MESSAGES ──
-- Tout visiteur peut envoyer un message (validation anti-spam minimale)
create policy "messages_public_insert"
  on messages for insert
  with check (
    email ~* '^[^@]+@[^@]+\.[^@]+$'
    and length(message) > 10
  );

-- Lecture : membres du garage concerné uniquement
create policy "messages_member_read"
  on messages for select to authenticated
  using (garage_id in (select my_garage_ids()));

-- Mise à jour (mark as read) : membres du garage
create policy "messages_member_update"
  on messages for update to authenticated
  using (garage_id in (select my_garage_ids()));

-- ─────────────────────────────────────────────────────────────────
--  DONNÉES INITIALES
-- ─────────────────────────────────────────────────────────────────
insert into garages (
  id, name, slug, address, city, postal_code, phone, email,
  plan, lat, lng, description, is_active, google_maps_url, opening_hours
)
values (
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
--    {vehicle_id}/main.webp          ← thumbnail principal (≥ 1200×800)
--    {vehicle_id}/gallery/001.webp   ← images secondaires numérotées
--
--  Workflow upload :
--    1. Créer le véhicule → récupérer son UUID
--    2. Upload : storage.upload(`${id}/main.webp`, file)
--    3. Insérer dans vehicle_images (url, is_primary=true, sort_order=0)
--    4. Stocker aussi dans vehicles.thumbnail_url pour accès direct
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
--    garageId         → garage_id
--    critAir          → crit_air
--    thumbnailUrl     → thumbnail_url
--    featuredOrder    → featured_order
--    meta_description → meta_description  (déjà snake_case)
--    export_leboncoin → export_leboncoin  (déjà snake_case)
--    external_id      → external_id       (déjà snake_case)
--    published_at     → published_at      (déjà snake_case)
--    sold_at          → sold_at           (déjà snake_case)
--    createdAt        → created_at
--    updatedAt        → updated_at
--
--  Garage :
--    logo_url         → logo_url          (déjà snake_case)
--    is_active        → is_active         (déjà snake_case)
--    postal_code      → postal_code       (déjà snake_case)
--    google_maps_url  → google_maps_url   (déjà snake_case)
--    opening_hours    → opening_hours     (déjà snake_case)
--    createdAt        → created_at
--    updatedAt        → updated_at
--
--  Message :
--    garage_id   → garage_id   (déjà snake_case)
--    vehicle_id  → vehicle_id  (déjà snake_case)
--    read_at     → read_at     (déjà snake_case)
--    created_at  → created_at  (déjà snake_case)
--
-- ═══════════════════════════════════════════════════════════════
