-- ─────────────────────────────────────────────────────────────────────────────
--  Migration 028 — Hardening SECURITY DEFINER functions
--
--  Contexte (Security Advisor — 30 juin 2026) :
--
--    ① can_write_garage        — SECURITY DEFINER sans SET search_path
--    ② my_garage_ids           — SECURITY DEFINER avec search_path='' (non reconnu)
--    ③ cleanup_old_login_attempts — SECURITY DEFINER sans SET search_path
--
--  Corrections appliquées :
--    A. Ajout de SET search_path = public sur les 3 fonctions DEFINER
--       → Bloque le search_path hijacking (CVE pattern standard PostgreSQL)
--       → Logique interne : INCHANGÉE (aucune modification du corps)
--
--    B. REVOKE EXECUTE FROM anon sur can_write_garage et my_garage_ids
--       → Ces fonctions sont uniquement utilisées dans des policies TO authenticated
--       → anon n'en a jamais besoin
--       → Les policies RLS authenticated continuent de fonctionner
--         (PostgreSQL évalue les policies dans le contexte du rôle appelant ;
--          authenticated conserve EXECUTE via PUBLIC jusqu'au REVOKE ciblé)
--
--    C. REVOKE EXECUTE FROM anon, authenticated sur cleanup_old_login_attempts
--       → Fonction absente de tout code TypeScript et de toute policy RLS
--       → Appelable uniquement par service_role / postgres (pg_cron ou scripts admin)
--       → L'exposition publique permettait à n'importe quel visiteur de déclencher
--         un nettoyage de la table de rate-limiting — risque de contournement partiel
--
--  NON TOUCHÉ :
--    - Logique métier des fonctions (corps inchangé)
--    - Policies RLS (aucune modification)
--    - Tables, colonnes, indexes
--    - set_updated_at / check_vehicle_image_garage (SECURITY INVOKER — hors scope)
--    - login_attempts (RLS sans policy = intentionnel, service_role only)
--    - Buckets et policies Storage
--
--  Idempotent : CREATE OR REPLACE + REVOKE sont sans effet si déjà appliqués.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── A. Fonctions SECURITY DEFINER — ajout SET search_path = public ────────────

-- ① can_write_garage
--    Protège toutes les écritures admin (véhicules, services, banners…)
--    Logique inchangée. Seul ajout : SET search_path = public
CREATE OR REPLACE FUNCTION public.can_write_garage(gid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM garage_users
    WHERE garage_id = gid
      AND user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
  );
$$;

-- ② my_garage_ids
--    Utilisée dans les policies member_read (vehicles, messages…)
--    Logique inchangée. search_path='' remplacé par search_path=public (standard Supabase)
CREATE OR REPLACE FUNCTION public.my_garage_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT garage_id FROM public.garage_users WHERE user_id = auth.uid();
$$;

-- ③ cleanup_old_login_attempts
--    Maintenance de la table de rate-limiting
--    Logique inchangée. Seul ajout : SET search_path = public
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM login_attempts
  WHERE last_attempt_at < now() - interval '1 hour'
    AND (blocked_until IS NULL OR blocked_until < now());
$$;


-- ── B. REVOKE EXECUTE FROM anon — can_write_garage et my_garage_ids ───────────
--
--  Ces fonctions sont exposées à anon via PUBLIC par défaut.
--  Elles ne sont jamais appelées via /rest/v1/rpc/ dans le code de l'application.
--  Les policies RLS qui les utilisent sont déclarées TO authenticated uniquement
--  → anon n'a pas de raison légitime d'exécuter ces fonctions.
--
--  NB : REVOKE FROM PUBLIC retire le droit à anon ET authenticated.
--       On ré-accorde explicitement à authenticated pour préserver les policies RLS.
--       postgres et service_role conservent leurs droits (hors PUBLIC).

REVOKE EXECUTE ON FUNCTION public.can_write_garage(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.can_write_garage(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.my_garage_ids() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.my_garage_ids() TO authenticated;


-- ── C. REVOKE EXECUTE FROM anon, authenticated — cleanup_old_login_attempts ───
--
--  Fonction absente de toute policy RLS et de tout code TypeScript.
--  Destinée à service_role / postgres uniquement (scripts admin, pg_cron).
--  L'exposition publique permettait à un visiteur non authentifié de la déclencher.

REVOKE EXECUTE ON FUNCTION public.cleanup_old_login_attempts() FROM PUBLIC;
