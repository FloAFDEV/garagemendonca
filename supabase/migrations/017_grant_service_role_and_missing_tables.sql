-- ─────────────────────────────────────────────────────────────────────────────
--  Migration 017 — Hardening grants : service_role + tables manquantes
--
--  Contexte :
--    Supabase va arrêter l'exposition automatique des tables public à la Data API.
--    À partir d'octobre 2026, GRANT explicite obligatoire pour TOUS les rôles.
--    Ce fichier corrige deux lacunes des migrations précédentes :
--
--    ① service_role absent de tous les GRANTs (migrations 008 et 011)
--       → Les Edge Functions et scripts admin utilisant la clé service_role
--         ont un accès implicite aujourd'hui via bypass RLS, mais à partir
--         d'octobre 2026 le GRANT table-level sera aussi requis.
--
--    ② testimonials et garage_gallery sans aucun GRANT
--       → anon ne peut pas lire les témoignages ni la galerie atelier
--       → authenticated ne peut pas les administrer
--
--  Tables existantes : non cassées aujourd'hui (comportement hérité conservé).
--  Ce patch est préventif — deadline Supabase : octobre 2026.
--
--  Sûr à ré-exécuter : GRANT est idempotent (pas d'erreur si déjà accordé).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── ① service_role — tables couvertes par 008_fix_grants.sql ─────────────────

GRANT ALL ON public.vehicles            TO service_role;
GRANT ALL ON public.vehicle_images      TO service_role;
GRANT ALL ON public.vehicle_categories  TO service_role;
GRANT ALL ON public.services            TO service_role;
GRANT ALL ON public.service_images      TO service_role;
GRANT ALL ON public.banners             TO service_role;
GRANT ALL ON public.garages             TO service_role;
GRANT ALL ON public.messages            TO service_role;
GRANT ALL ON public.garage_users        TO service_role;

-- ── ① service_role — tables couvertes par 011_apply_007_tables_and_grants.sql ─

GRANT ALL ON public.garage_content            TO service_role;
GRANT ALL ON public.garage_stats              TO service_role;
GRANT ALL ON public.garage_trust_badges       TO service_role;
GRANT ALL ON public.garage_reassurances       TO service_role;
GRANT ALL ON public.garage_cta_guarantees     TO service_role;
GRANT ALL ON public.garage_vehicle_guarantees TO service_role;
GRANT ALL ON public.service_steps             TO service_role;
GRANT ALL ON public.service_pricing           TO service_role;
GRANT ALL ON public.service_faq               TO service_role;

-- ── ② testimonials — zéro GRANT depuis 003_testimonials.sql ──────────────────
--  Données publiques (homepage) → anon: SELECT
--  Administration admin         → authenticated: ALL (limité par RLS)
--  Edge Functions / scripts     → service_role: ALL

GRANT SELECT
  ON public.testimonials
  TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.testimonials
  TO authenticated;

GRANT ALL
  ON public.testimonials
  TO service_role;

-- ── ② garage_gallery — zéro GRANT depuis 004_garage_gallery.sql ──────────────
--  Galerie atelier publique → anon: SELECT
--  Administration admin     → authenticated: ALL (limité par RLS)
--  Edge Functions / scripts → service_role: ALL

GRANT SELECT
  ON public.garage_gallery
  TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.garage_gallery
  TO authenticated;

GRANT ALL
  ON public.garage_gallery
  TO service_role;
