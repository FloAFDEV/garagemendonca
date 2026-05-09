-- ═══════════════════════════════════════════════════════════════════
--  004_garage_gallery.sql — Garage Auto Mendonca — Galerie atelier
--
--  Sûr à ré-exécuter (IF NOT EXISTS, DROP … IF EXISTS).
--  Zéro breaking change : nouvelle table uniquement.
--  Supabase Dashboard > SQL Editor > Run.
--
--  Périmètre :
--    • Création de la table `garage_gallery`
--    • Photos de l'atelier affichées dans components/home/GalleryAtelier.tsx
--    • Support du layout CSS (colonne `span`) : normal | large
--      → 'large' = lg:col-span-2 lg:row-span-2 (photo vedette en position 0)
--    • RLS : lecture publique totale, écriture admin uniquement
--    • Trigger updated_at
--    • Seed initial avec les 5 photos actuellement hardcodées
--      (URLs Unsplash — à remplacer par Storage Supabase en production)
--
--  Bucket Storage cible : garage-logos (public, CDN activé)
--  Naming convention  : {garage_id}/gallery/{uuid}.webp
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Création de la table ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS garage_gallery (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id   uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  url         text        NOT NULL,         -- Supabase Storage URL ou URL externe temporaire
  alt         text        NOT NULL DEFAULT '',
  caption     text,                         -- légende affichée sur la photo ("Atelier mécanique")
  span        text        NOT NULL DEFAULT 'normal'
                          CHECK (span IN ('normal', 'large')),
                          -- 'large' → lg:col-span-2 lg:row-span-2 dans GalleryAtelier.tsx
  sort_order  smallint    NOT NULL DEFAULT 0,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 2. Trigger updated_at ─────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_garage_gallery_updated_at ON garage_gallery;
CREATE TRIGGER trg_garage_gallery_updated_at
  BEFORE UPDATE ON garage_gallery
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 3. Indexes ────────────────────────────────────────────────────

-- Requête principale : SELECT … WHERE garage_id = ? AND is_active = true ORDER BY sort_order
CREATE INDEX IF NOT EXISTS idx_gallery_garage_active
  ON garage_gallery(garage_id, is_active, sort_order)
  WHERE is_active = true;

-- ── 4. RLS ────────────────────────────────────────────────────────

ALTER TABLE garage_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_public_read"  ON garage_gallery;
DROP POLICY IF EXISTS "gallery_admin_write"  ON garage_gallery;

-- Lecture publique totale : photos de galerie toujours visibles
CREATE POLICY "gallery_public_read" ON garage_gallery
  FOR SELECT USING (is_active = true);

-- Écriture : admin du garage uniquement
CREATE POLICY "gallery_admin_write" ON garage_gallery
  FOR ALL TO authenticated
  USING (can_write_garage(garage_id))
  WITH CHECK (can_write_garage(garage_id));

-- ── 5. Seed initial ───────────────────────────────────────────────
--  Migration des 5 photos hardcodées dans GalleryAtelier.tsx.
--  URLs Unsplash conservées temporairement — à remplacer par URLs
--  Supabase Storage après upload des vraies photos de l'atelier.
--  UUIDs fixes → idempotent via ON CONFLICT DO NOTHING.

INSERT INTO garage_gallery
  (id, garage_id, url, alt, caption, span, sort_order, is_active)
VALUES

  -- Photo 1 : vedette (large — lg:col-span-2 lg:row-span-2)
  (
    '00000000-0000-0000-0000-000000000701',
    '00000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80',
    'Mécanicien au travail sur un moteur',
    'Atelier mécanique',
    'large',
    0,
    true
  ),

  -- Photo 2 : pont élévateur
  (
    '00000000-0000-0000-0000-000000000702',
    '00000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
    'Véhicule sur pont élévateur',
    'Pont élévateur',
    'normal',
    1,
    true
  ),

  -- Photo 3 : diagnostic électronique
  (
    '00000000-0000-0000-0000-000000000703',
    '00000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
    'Diagnostic électronique automobile',
    'Diagnostic électronique',
    'normal',
    2,
    true
  ),

  -- Photo 4 : outillage
  (
    '00000000-0000-0000-0000-000000000704',
    '00000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&q=80',
    'Outils de mécanique professionnels',
    'Outillage professionnel',
    'normal',
    3,
    true
  ),

  -- Photo 5 : espace de travail
  (
    '00000000-0000-0000-0000-000000000705',
    '00000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
    'Atelier automobile équipé',
    'Espace de travail',
    'normal',
    4,
    true
  )

ON CONFLICT (id) DO NOTHING;
