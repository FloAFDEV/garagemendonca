-- ═══════════════════════════════════════════════════════════════
--  Garage Auto Mendonça — Schéma Supabase (PostgreSQL)
--  Architecture multi-garages — v1
-- ═══════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Types ENUM ──────────────────────────────────────────────────
create type vehicle_status as enum ('available', 'reserved', 'sold');
create type user_role       as enum ('superadmin', 'admin', 'staff');
create type garage_plan     as enum ('isolated', 'shared');
create type fuel_type       as enum ('Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL', 'Hydrogène');
create type transmission    as enum ('Manuelle', 'Automatique');

-- ── Table : garages ─────────────────────────────────────────────
create table garages (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  address     text,
  phone       text,
  email       text,
  plan        garage_plan not null default 'isolated',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Table : vehicles ────────────────────────────────────────────
create table vehicles (
  id              uuid primary key default uuid_generate_v4(),
  garage_id       uuid not null references garages(id) on delete cascade,
  brand           text not null,
  model           text not null,
  year            integer not null check (year between 1900 and 2100),
  mileage         integer not null check (mileage >= 0),
  fuel            fuel_type not null,
  transmission    transmission not null,
  power           integer check (power >= 0),
  price           integer not null check (price >= 0),
  color           text not null,
  doors           integer default 5 check (doors in (2, 3, 4, 5)),
  crit_air        text,
  description     text,
  images          text[] default '{}',
  thumbnail_url   text,
  status          vehicle_status not null default 'available',
  featured        boolean not null default false,
  featured_order  integer,
  features        jsonb default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Index pour les requêtes fréquentes
create index idx_vehicles_garage_id  on vehicles(garage_id);
create index idx_vehicles_status     on vehicles(status);
create index idx_vehicles_featured   on vehicles(featured) where featured = true;

-- ── Table : garage_users ────────────────────────────────────────
create table garage_users (
  id          uuid primary key default uuid_generate_v4(),
  garage_id   uuid not null references garages(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        user_role not null default 'staff',
  created_at  timestamptz not null default now(),
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

-- ── Row Level Security (RLS) ────────────────────────────────────
alter table garages       enable row level security;
alter table vehicles      enable row level security;
alter table garage_users  enable row level security;

-- Superadmin : accès complet (à configurer via service_role ou claim JWT)
-- Staff/Admin : voit uniquement les véhicules de son garage (plan isolated)
--              ou tous les véhicules si plan = 'shared'

create policy "vehicles_garage_isolated"
  on vehicles for select
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

create policy "vehicles_write_own_garage"
  on vehicles for all
  using (
    garage_id in (
      select gu.garage_id from garage_users gu
      where gu.user_id = auth.uid()
      and gu.role in ('admin', 'superadmin')
    )
  );

-- ── Données de démo ─────────────────────────────────────────────
insert into garages (id, name, slug, address, phone, email, plan) values
  ('00000000-0000-0000-0000-000000000001', 'Garage Auto Mendonça',
   'garage-mendonca', '6 Avenue de la Mouyssaguese, 31280 Drémil-Lafage',
   '05 32 00 20 38', 'contact@garagemendonca.com', 'isolated');
