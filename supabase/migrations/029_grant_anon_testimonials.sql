-- Migration 029 — Restaure GRANT SELECT sur testimonials pour anon
-- Le grant était présent dans 017 mais absent en base (révoqué ou reset partiel).
-- Sans ce grant, la policy testimonials_public_read est inopérante → erreur 42501.
GRANT SELECT ON public.testimonials TO anon;
