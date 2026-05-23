-- Backfill category_id pour tous les véhicules actuellement sans catégorie.
-- Règle stricte : uniquement WHERE category_id IS NULL — ne jamais écraser.
-- Cible : catégorie "Voitures" du même garage.

UPDATE public.vehicles v
SET    category_id = vc.id
FROM   public.vehicle_categories vc
WHERE  v.garage_id    = vc.garage_id
  AND  vc.slug        = 'voitures'
  AND  v.category_id  IS NULL;
