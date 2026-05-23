-- Seed catégories par défaut pour tous les garages existants.
-- Idempotent : ON CONFLICT DO NOTHING — safe en replay.

INSERT INTO public.vehicle_categories (garage_id, slug, label, icon, sort_order, is_active)
SELECT g.id, 'voitures', 'Voitures', '🚗', 1, true
FROM public.garages g
ON CONFLICT (garage_id, slug) DO NOTHING;

INSERT INTO public.vehicle_categories (garage_id, slug, label, icon, sort_order, is_active)
SELECT g.id, 'utilitaires', 'Utilitaires', '🚐', 2, true
FROM public.garages g
ON CONFLICT (garage_id, slug) DO NOTHING;
