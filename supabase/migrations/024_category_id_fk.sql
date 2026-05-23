-- Migration 024 — Ajout de category_id FK sur vehicles
--
-- Architecture marketplace : 1 véhicule = 1 catégorie principale (source de vérité)
-- vehicles.categories TEXT[] reste en lecture seule pour rétrocompatibilité
-- Suppression du TEXT[] prévue après stabilisation front + SEO

-- 1. Ajouter category_id FK
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.vehicle_categories(id) ON DELETE SET NULL;

-- 2. Backfill depuis categories[1] (premier slug du tableau)
UPDATE public.vehicles v
SET category_id = (
  SELECT vc.id
  FROM public.vehicle_categories vc
  WHERE vc.slug = v.categories[1]
    AND vc.garage_id = v.garage_id
    AND vc.is_active = true
  LIMIT 1
)
WHERE
  v.category_id IS NULL
  AND array_length(v.categories, 1) > 0;

-- 3. Index pour performances
CREATE INDEX IF NOT EXISTS idx_vehicles_category_id ON public.vehicles(category_id);
