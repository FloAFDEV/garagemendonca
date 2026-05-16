-- ─────────────────────────────────────────────────────────────────────────────
--  TEMPLATE — Nouvelle migration Supabase
--  Copier ce fichier, renommer en NNN_description.sql, adapter le contenu.
--
--  ┌─ RÈGLE ABSOLUE (Supabase — en vigueur octobre 2026) ──────────────────────┐
--  │  Créer une table ne suffit plus pour qu'elle soit accessible via la       │
--  │  Data API (supabase-js, REST, GraphQL).                                   │
--  │  Toute nouvelle table DOIT recevoir des GRANT explicites, sinon :         │
--  │    { "code": "42501", "message": "permission denied for table ..." }      │
--  │                                                                            │
--  │  Trois rôles à couvrir systématiquement :                                 │
--  │   • anon          → clients non connectés (lecture publique uniquement)   │
--  │   • authenticated → admins connectés (CRUD limité par RLS)                │
--  │   • service_role  → Edge Functions / scripts admin (bypass RLS)           │
--  └────────────────────────────────────────────────────────────────────────────┘
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Table ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.example (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id  uuid        NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  -- ... colonnes métier ...
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── 2. Trigger updated_at ────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_example_updated_at ON public.example;
CREATE TRIGGER trg_example_updated_at
  BEFORE UPDATE ON public.example
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 3. Index ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_example_garage
  ON public.example (garage_id);

-- ── 4. RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE public.example ENABLE ROW LEVEL SECURITY;

-- ── 5. Politiques RLS ────────────────────────────────────────────────────────

-- Exemple A — données publiques (testimonials, galerie, services…)
CREATE POLICY "example_public_read"
  ON public.example
  FOR SELECT
  USING (true);                     -- ou: WHERE is_active = true

CREATE POLICY "example_admin_write"
  ON public.example
  FOR ALL
  TO authenticated
  USING (can_write_garage(garage_id))
  WITH CHECK (can_write_garage(garage_id));

-- Exemple B — données utilisateur (messages, leads, replies…)
-- CREATE POLICY "example_owner"
--   ON public.example
--   FOR ALL
--   TO authenticated
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- ── 6. GRANTS — OBLIGATOIRES ─────────────────────────────────────────────────
--
--  Adapter selon l'exposition souhaitée :
--
--  Données publiques (lecture côté client sans auth) :
--    GRANT SELECT ON public.example TO anon;
--
--  Données internes (auth requise, pas de lecture publique) :
--    -- pas de GRANT sur anon
--
--  Toujours accorder à authenticated et service_role :

-- Lecture publique (supprimer si données non publiques)
GRANT SELECT
  ON public.example
  TO anon;

-- CRUD admin limité par les policies RLS ci-dessus
GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.example
  TO authenticated;

-- Accès total pour Edge Functions et scripts admin (bypass RLS)
GRANT ALL
  ON public.example
  TO service_role;
