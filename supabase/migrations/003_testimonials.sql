-- ═══════════════════════════════════════════════════════════════════
--  003_testimonials.sql — Garage Auto Mendonca — Témoignages homepage
--
--  Sûr à ré-exécuter (IF NOT EXISTS, DROP … IF EXISTS).
--  Zéro breaking change : nouvelle table uniquement.
--  Supabase Dashboard > SQL Editor > Run.
--
--  Périmètre :
--    • Création de la table `testimonials`
--    • Témoignages liés à un garage (homepage, sections marketing)
--    • Distinct de services.testimonials (qui sont par service)
--    • RLS : lecture publique, écriture admin uniquement
--    • Trigger updated_at
--    • Seed initial avec les 3 témoignages actuellement hardcodés
--      dans components/home/Testimonials.tsx
--
--  Relation DB :
--    testimonials.garage_id → garages.id (FK CASCADE)
--    testimonials.source    → 'direct' | 'google' | 'leboncoin'
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Création de la table ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS testimonials (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id    uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  author       text        NOT NULL,
  location     text,
  date_label   text,                              -- ex. "Juillet 2024" (format libre)
  rating       smallint    NOT NULL DEFAULT 5
                           CHECK (rating BETWEEN 1 AND 5),
  content      text        NOT NULL,
  avatar_color text        NOT NULL DEFAULT '#2563eb', -- couleur hex de l'avatar fallback
  source       text        NOT NULL DEFAULT 'direct'
                           CHECK (source IN ('direct', 'google', 'leboncoin', 'other')),
  is_active    boolean     NOT NULL DEFAULT true,
  sort_order   smallint    NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ── 2. Trigger updated_at ─────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_testimonials_updated_at ON testimonials;
CREATE TRIGGER trg_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 3. Indexes ────────────────────────────────────────────────────

-- Requête principale : SELECT … WHERE garage_id = ? AND is_active = true ORDER BY sort_order
CREATE INDEX IF NOT EXISTS idx_testimonials_garage_active
  ON testimonials(garage_id, is_active, sort_order)
  WHERE is_active = true;

-- ── 4. RLS ────────────────────────────────────────────────────────

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "testimonials_public_read"  ON testimonials;
DROP POLICY IF EXISTS "testimonials_admin_write"  ON testimonials;

-- Lecture publique : uniquement les témoignages actifs
CREATE POLICY "testimonials_public_read" ON testimonials
  FOR SELECT USING (is_active = true);

-- Écriture : admin du garage uniquement
CREATE POLICY "testimonials_admin_write" ON testimonials
  FOR ALL TO authenticated
  USING (can_write_garage(garage_id))
  WITH CHECK (can_write_garage(garage_id));

-- ── 5. Seed initial ───────────────────────────────────────────────
--  Migration des 3 témoignages hardcodés dans Testimonials.tsx.
--  UUIDs fixes → idempotent via ON CONFLICT DO NOTHING.

INSERT INTO testimonials
  (id, garage_id, author, location, date_label, rating, content, avatar_color, source, is_active, sort_order)
VALUES

  -- Témoignage 1 : Patrick L. (Toulouse)
  (
    '00000000-0000-0000-0000-000000000601',
    '00000000-0000-0000-0000-000000000001',
    'Patrick L.',
    'Toulouse',
    'Juillet 2024',
    5,
    'Après l''allumage de 3 voyants sur mon BMW X5, j''ai été reçu le lendemain matin sans rendez-vous. Diagnostic rapide, devis clair, réparation dans la journée. Vraiment sérieux.',
    '#2563eb',
    'direct',
    true,
    0
  ),

  -- Témoignage 2 : Isabelle M. (Drémil-Lafage)
  (
    '00000000-0000-0000-0000-000000000602',
    '00000000-0000-0000-0000-000000000001',
    'Isabelle M.',
    'Drémil-Lafage',
    'Avril 2024',
    5,
    'M. Mendonca est très consciencieux. Il m''a bien expliqué les réparations à effectuer sur ma Toyota Yaris et n''a rien fait sans mon accord. Je recommande vivement.',
    '#059669',
    'direct',
    true,
    1
  ),

  -- Témoignage 3 : Laurent B. (Quint-Fonsegrives)
  (
    '00000000-0000-0000-0000-000000000603',
    '00000000-0000-0000-0000-000000000001',
    'Laurent B.',
    'Quint-Fonsegrives',
    'Février 2024',
    5,
    'Véhicule de courtoisie mis à disposition gratuitement le temps de la réparation. Travail soigné sur ma boîte automatique. Prix honnête. Je suis client depuis 5 ans.',
    '#7c3aed',
    'direct',
    true,
    2
  )

ON CONFLICT (id) DO NOTHING;
