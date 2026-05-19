-- Migration 019 : ajout display_order sur vehicles
-- Permet un tri manuel des annonces indépendant de featured_order.
-- Règle de tri unique : featured DESC, display_order ASC NULLS LAST, created_at DESC

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT NULL;

COMMENT ON COLUMN public.vehicles.display_order IS
  'Ordre d''affichage manuel (1 = premier). NULL = aucune priorité, trié par date.';

-- Index pour accélérer les tris sur le catalogue public
CREATE INDEX IF NOT EXISTS idx_vehicles_display_order
  ON public.vehicles (garage_id, display_order ASC NULLS LAST);
