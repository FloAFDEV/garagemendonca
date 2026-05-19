-- Migration 020 : s'assurer que service-images et banner-images sont publics
-- Ces buckets doivent être publics pour que les URLs directes fonctionnent
-- (getStoragePublicUrl — pas de signed URLs).

UPDATE storage.buckets
SET public = true
WHERE id IN ('service-images', 'banner-images');
