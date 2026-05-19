-- Store the storage path separately so we can compute public URLs
-- without relying on a full URL being saved in image_url.
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS image_storage_path TEXT;
