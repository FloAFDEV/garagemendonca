-- ═══════════════════════════════════════════════════════════════════
--  seed.sql — Données de test réalistes — Garage Auto Mendonça
--
--  Prérequis : 001_init.sql exécuté.
--  Idempotent : ON CONFLICT DO NOTHING sur tous les INSERT.
--
--  Contenu :
--    • 3 catégories de véhicules
--    • 5 véhicules publiés + 2 brouillons
--    • 3 services
--    • 1 bannière active
--    • 5 messages (mix new/read)
-- ═══════════════════════════════════════════════════════════════════

-- UUIDs fixes pour reproductibilité
-- Garage  : 00000000-0000-0000-0000-000000000001  (défini dans 001_init.sql)
-- Catégs  : 00000000-0000-0000-0000-000000000101 à ...103
-- Véhicules: 00000000-0000-0000-0000-000000000201 à ...207
-- Services : 00000000-0000-0000-0000-000000000301 à ...303
-- Banner  : 00000000-0000-0000-0000-000000000401
-- Messages: 00000000-0000-0000-0000-000000000501 à ...505

-- ── Catégories ────────────────────────────────────────────────────
INSERT INTO vehicle_categories (id, garage_id, slug, label, icon, color, sort_order, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001',
   'voitures', 'Voitures', '🚗', '#3b82f6', 0, true),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001',
   'utilitaires', 'Utilitaires', '🚐', '#f59e0b', 1, true),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001',
   'premium', 'Premium', '⭐', '#8b5cf6', 2, true)
ON CONFLICT (garage_id, slug) DO NOTHING;

-- ── Véhicules publiés ─────────────────────────────────────────────

INSERT INTO vehicles (
  id, garage_id, brand, model, year, mileage, fuel, transmission,
  power, price, color, doors, description, status, published_at,
  featured, featured_order, categories, slug, meta_description,
  options, features
) VALUES

-- 1. Toyota Yaris Hybride
('00000000-0000-0000-0000-000000000201',
 '00000000-0000-0000-0000-000000000001',
 'Toyota', 'Yaris', 2021, 38500, 'Hybride', 'Automatique',
 116, 16900, 'Blanc Nacré', 5,
 'Toyota Yaris hybride automatique en excellent état. Idéale en ville et sur route, très économique. Carnet d''entretien complet. Garantie 6 mois.',
 'published', now() - interval '10 days',
 true, 1,
 ARRAY['voitures'],
 'toyota-yaris-hybride-automatique-2021',
 'Toyota Yaris Hybride 116ch Automatique 2021 — 38 500 km — 16 900 € — Garage Mendonça Drémil-Lafage',
 '{"climatisation_automatique":true,"bluetooth":true,"regulateur_vitesse":true,"camera_recul":true,"ecran_tactile":true,"demarrage_sans_cle":true}',
 '{"nb_portes":5,"nb_places":5,"puissance_fiscale":6}'
),

-- 2. Honda CR-V Hybride
('00000000-0000-0000-0000-000000000202',
 '00000000-0000-0000-0000-000000000001',
 'Honda', 'CR-V', 2020, 52000, 'Hybride', 'Automatique',
 184, 24500, 'Gris Métallisé', 5,
 'Honda CR-V e:HEV, SUV hybride automatique 4 places, très bien équipé. Toit panoramique, sièges chauffants, GPS. Première main, 0 accident.',
 'published', now() - interval '8 days',
 true, 2,
 ARRAY['voitures', 'premium'],
 'honda-cr-v-hybride-automatique-2020',
 'Honda CR-V Hybride 184ch Automatique 2020 — 52 000 km — 24 500 € — Garage Mendonça',
 '{"toit_panoramique":true,"climatisation_automatique":true,"sieges_chauffants":true,"gps":true,"camera_recul":true,"regulateur_adaptatif":true,"jantes_alliage":true}',
 '{"nb_portes":5,"nb_places":5,"puissance_fiscale":9}'
),

-- 3. Nissan Micra
('00000000-0000-0000-0000-000000000203',
 '00000000-0000-0000-0000-000000000001',
 'Nissan', 'Micra', 2019, 61200, 'Essence', 'Automatique',
 90, 11400, 'Rouge', 5,
 'Nissan Micra boîte automatique CVT, agréable à conduire en ville. Entretien Nissan, pas d''accident, prête à rouler.',
 'published', now() - interval '15 days',
 false, NULL,
 ARRAY['voitures'],
 'nissan-micra-essence-automatique-2019',
 'Nissan Micra 90ch Automatique 2019 — 61 200 km — 11 400 € — Garage Mendonça Drémil-Lafage',
 '{"climatisation":true,"bluetooth":true,"regulateur_vitesse":true}',
 '{"nb_portes":5,"nb_places":5,"puissance_fiscale":4}'
),

-- 4. Lexus IS 300h
('00000000-0000-0000-0000-000000000204',
 '00000000-0000-0000-0000-000000000001',
 'Lexus', 'IS 300h', 2018, 89000, 'Hybride', 'Automatique',
 223, 22800, 'Noir Obsidienne', 4,
 'Lexus IS 300h hybride, berline premium automatique. Finition Executive, cuir full. Carnet d''entretien Lexus. Véhicule d''exception au prix du marché.',
 'published', now() - interval '5 days',
 true, 3,
 ARRAY['voitures', 'premium'],
 'lexus-is-300h-hybride-automatique-2018',
 'Lexus IS 300h Hybride 223ch Automatique 2018 — 89 000 km — 22 800 € — Garage Mendonça',
 '{"climatisation_automatique":true,"toit_panoramique":true,"sieges_chauffants":true,"gps":true,"camera_recul":true,"jantes_alliage":true,"regulateur_adaptatif":true,"demarrage_sans_cle":true,"ecran_tactile":true}',
 '{"nb_portes":4,"nb_places":5,"puissance_fiscale":10}'
),

-- 5. Mazda CX-5
('00000000-0000-0000-0000-000000000205',
 '00000000-0000-0000-0000-000000000001',
 'Mazda', 'CX-5', 2022, 28000, 'Diesel', 'Automatique',
 150, 27900, 'Bleu Métallisé', 5,
 'Mazda CX-5 Skyactiv-D 150ch automatique, SUV familial. Finition Exclusive-Line. Garantie constructeur restante jusqu''en 2025.',
 'published', now() - interval '3 days',
 false, NULL,
 ARRAY['voitures'],
 'mazda-cx5-diesel-automatique-2022',
 'Mazda CX-5 Diesel 150ch Automatique 2022 — 28 000 km — 27 900 € — Garage Mendonça Drémil-Lafage',
 '{"climatisation_automatique":true,"camera_recul":true,"regulateur_adaptatif":true,"jantes_alliage":true,"ecran_tactile":true,"gps":true,"bluetooth":true}',
 '{"nb_portes":5,"nb_places":5,"puissance_fiscale":8}'
)

ON CONFLICT (id) DO NOTHING;

-- ── Véhicules brouillons ──────────────────────────────────────────
INSERT INTO vehicles (
  id, garage_id, brand, model, year, mileage, fuel, transmission,
  power, price, color, doors, status, categories, slug
) VALUES

('00000000-0000-0000-0000-000000000206',
 '00000000-0000-0000-0000-000000000001',
 'Honda', 'Jazz', 2023, 12000, 'Hybride', 'Automatique',
 109, 21500, 'Blanc', 5,
 'draft', ARRAY['voitures'],
 'honda-jazz-hybride-automatique-2023'
),

('00000000-0000-0000-0000-000000000207',
 '00000000-0000-0000-0000-000000000001',
 'Toyota', 'RAV4', 2020, 74000, 'Hybride', 'Automatique',
 218, 29900, 'Gris', 5,
 'draft', ARRAY['voitures'],
 'toyota-rav4-hybride-automatique-2020'
)

ON CONFLICT (id) DO NOTHING;

-- ── Services ──────────────────────────────────────────────────────
INSERT INTO services (
  id, garage_id, slug, sort_order, title, icon,
  short_description, long_description, features, is_active
) VALUES

('00000000-0000-0000-0000-000000000301',
 '00000000-0000-0000-0000-000000000001',
 'mecanique', 0, 'Mécanique Générale', 'wrench',
 'Entretien et réparation toutes marques — révision, freinage, distribution, suspension.',
 'Notre atelier mécanique prend en charge tous types de réparations sur toutes marques de véhicules. Nos techniciens formés diagnostiquent rapidement et interviennent avec des pièces de qualité (origine ou équivalent constructeur). Devis gratuit avant travaux.',
 ARRAY[
   'Révision complète (vidange, filtres, bougies)',
   'Freinage (disques, plaquettes, liquide)',
   'Distribution et courroie d''accessoires',
   'Suspension et direction',
   'Diagnostic électronique'
 ],
 true
),

('00000000-0000-0000-0000-000000000302',
 '00000000-0000-0000-0000-000000000001',
 'boite-automatique', 1, 'Boîte Automatique', 'settings',
 'Spécialiste boîte automatique et CVT — vidange, réparation, remplacement.',
 'La boîte automatique est notre spécialité historique depuis 2001. Nous intervenons sur toutes les technologies : boîtes hydrauliques classiques, CVT, DSG/DCT, boîtes e-CVT hybrides (Toyota, Honda, Lexus…). Vidange à l''intervalle constructeur, remplacement sur échange standard ou neuf.',
 ARRAY[
   'Vidange boîte automatique (ATF)',
   'Boîtes CVT (Toyota, Nissan, Honda)',
   'Boîtes hybrides e-CVT',
   'DSG et boîtes à double embrayage',
   'Diagnostic électronique boîte',
   'Remplacement et échange standard'
 ],
 true
),

('00000000-0000-0000-0000-000000000303',
 '00000000-0000-0000-0000-000000000001',
 'carrosserie', 2, 'Carrosserie & Peinture', 'palette',
 'Réparation carrosserie, débosselage, peinture et traitement anticorrosion.',
 'Notre atelier carrosserie répare et repeint votre véhicule avec des teintes préparées à l''identique (colorimétrie assistée par ordinateur). Du petit choc à la remise en état complète, nous vous accompagnons aussi dans vos démarches assurance.',
 ARRAY[
   'Débosselage sans peinture (PDR)',
   'Peinture teinte identique',
   'Remplacement vitres et pare-brise',
   'Traitement anticorrosion',
   'Gestion sinistres assurance'
 ],
 true
)

ON CONFLICT (garage_id, slug) DO NOTHING;

-- ── Bannière active ───────────────────────────────────────────────
INSERT INTO banners (
  id, garage_id, is_active, message, sub_message,
  cta_label, cta_url, bg_color, display_pages, is_dismissible
) VALUES (
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000001',
  true,
  'Vidange boîte automatique — Offre Printemps 2025',
  'Révision complète + vidange boîte automatique à tarif préférentiel. Sur rendez-vous uniquement.',
  'Prendre rendez-vous',
  '/contact',
  '#991B1B',
  'all',
  true
) ON CONFLICT (id) DO NOTHING;

-- ── Messages de test ──────────────────────────────────────────────
INSERT INTO messages (id, garage_id, name, email, phone, subject, message, status, read_at)
VALUES

('00000000-0000-0000-0000-000000000501',
 '00000000-0000-0000-0000-000000000001',
 'Jean-Pierre Durand', 'jp.durand@email.fr', '06 12 34 56 78',
 'Renseignement véhicule',
 'Bonjour, je suis intéressé par la Toyota Yaris Hybride 2021. Est-elle encore disponible ? Merci.',
 'new', NULL
),

('00000000-0000-0000-0000-000000000502',
 '00000000-0000-0000-0000-000000000001',
 'Sophie Martin', 'sophie.martin@gmail.com', NULL,
 'Demande de devis réparation',
 'Bonjour, j''aurais besoin d''un devis pour la vidange de la boîte automatique de ma Honda Jazz 2019. Quels sont vos tarifs ?',
 'new', NULL
),

('00000000-0000-0000-0000-000000000503',
 '00000000-0000-0000-0000-000000000001',
 'Marc Leblanc', 'marc.leblanc@outlook.com', '07 98 76 54 32',
 'Prise de rendez-vous',
 'Je souhaite prendre rendez-vous pour la révision de mon véhicule la semaine prochaine. Avez-vous des disponibilités mardi ou mercredi matin ?',
 'read', now() - interval '1 day'
),

('00000000-0000-0000-0000-000000000504',
 '00000000-0000-0000-0000-000000000001',
 'Isabelle Petit', 'i.petit@yahoo.fr', '06 55 44 33 22',
 'Renseignement véhicule',
 'Bonjour, j''aimerais en savoir plus sur le Lexus IS 300h. Peut-on organiser un essai ? Merci d''avance.',
 'read', now() - interval '3 days'
),

('00000000-0000-0000-0000-000000000505',
 '00000000-0000-0000-0000-000000000001',
 'Thomas Nguyen', 'thomas.n@protonmail.com', NULL,
 'Demande d''information',
 'Bonjour, est-ce que vous acceptez la reprise de mon ancien véhicule lors de l''achat d''une voiture chez vous ? Si oui, comment ça se passe ?',
 'new', NULL
)

ON CONFLICT (id) DO NOTHING;
