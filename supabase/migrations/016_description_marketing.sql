-- ─────────────────────────────────────────────────────────────────
--  Migration 016 — Description marketing + original_description
--
--  Contexte : les véhicules importés depuis le scraping ont une
--  `description` brute contenant à la fois le texte narratif et une
--  liste d'options (***** Équipements et options *****).
--  `backfill-options.ts` extrait les options → JSONB `options` et
--  nettoie le texte. Ce schéma formalise les deux colonnes propres.
--
--  Colonnes ajoutées :
--    description_marketing  — texte narratif nettoyé, visible côté public
--    original_description   — texte brut du scraping (archivé, non affiché)
-- ─────────────────────────────────────────────────────────────────

-- 1. Colonne texte marketing (texte narratif propre, sans la liste d'options)
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS description_marketing TEXT;

-- 2. Colonne archive brute (backup idempotent du scraping)
--    Si déjà existante (ajoutée manuellement), la commande est sans effet.
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS original_description TEXT;

-- 3. Index full-text sur description_marketing (recherche admin / SEO interne)
CREATE INDEX IF NOT EXISTS vehicles_description_marketing_fts
  ON vehicles
  USING gin(to_tsvector('french', coalesce(description_marketing, '')));

-- 4. Backfill initial : pour les véhicules dont description a déjà été
--    nettoyée par backfill-options.ts (original_description remplie),
--    copier la description nettoyée dans description_marketing.
UPDATE vehicles
  SET description_marketing = description
  WHERE original_description IS NOT NULL
    AND description_marketing IS NULL;

-- 5. Pour les véhicules jamais traités : idem (description = brut pour l'instant,
--    backfill-options.ts viendra remplir description_marketing lors de sa prochaine exécution).

-- ─── RLS (hérite des policies existantes sur vehicles) ────────────
-- Pas de nouvelle table → pas de nouvelle policy nécessaire.
-- description_marketing est lisible par anon via la policy SELECT existante.
