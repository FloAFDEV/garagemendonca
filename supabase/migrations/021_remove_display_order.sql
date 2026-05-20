-- Migration 021 : suppression de display_order
--
-- Objectif : les 144 annonces importées le même jour ont un created_at identique.
-- On reconstruit une temporalité cohérente en assignant des created_at espacés
-- d'1 heure, en respectant l'ordre actuel (display_order ASC NULLS LAST, created_at DESC).
-- Après cela, un simple tri created_at DESC préserve l'ordre d'affichage historique.

-- 1. Reconstruire created_at à partir de l'ordre courant
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (
      ORDER BY display_order ASC NULLS LAST, created_at DESC
    ) AS rn
  FROM public.vehicles
)
UPDATE public.vehicles v
SET created_at = (NOW() - ((r.rn - 1) * interval '1 hour'))
FROM ranked r
WHERE v.id = r.id;

-- 2. Supprimer l'index et la colonne
DROP INDEX IF EXISTS idx_vehicles_display_order;
ALTER TABLE public.vehicles DROP COLUMN IF EXISTS display_order;
