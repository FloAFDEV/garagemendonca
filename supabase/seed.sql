-- ═══════════════════════════════════════════════════════════════════
--  seed.sql — Données de test réalistes — Garage Auto Mendonca
--
--  Prérequis : 001_init.sql exécuté.
--  Idempotent : ON CONFLICT DO NOTHING sur tous les INSERT.
--
--  Contenu :
--    • 1 garage complet
--    • 3 catégories de véhicules
--    • 10 véhicules publiés (7) + sold (1) + drafts (2)
--    • 5 services complets
--    • 3 bannières (1 active, 2 inactives / planifiées)
--    • 5 messages (mix new/read)
-- ═══════════════════════════════════════════════════════════════════

-- UUIDs fixes pour reproductibilité
-- Garage    : 00000000-0000-0000-0000-000000000001  (défini dans 001_init.sql)
-- Catégs    : 00000000-0000-0000-0000-000000000101 à ...103
-- Véhicules : 00000000-0000-0000-0000-000000000201 à ...210
-- Services  : 00000000-0000-0000-0000-000000000301 à ...305
-- Banners   : 00000000-0000-0000-0000-000000000401 à ...403
-- Messages  : 00000000-0000-0000-0000-000000000501 à ...505

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
  power, price, color, doors, crit_air, description, status, published_at,
  featured, featured_order, categories, slug, meta_description,
  options, features
) VALUES

-- 1. Toyota Yaris Hybride — featured #1
('00000000-0000-0000-0000-000000000201',
 '00000000-0000-0000-0000-000000000001',
 'Toyota', 'Yaris', 2021, 38500, 'Hybride', 'Automatique',
 116, 16900, 'Blanc Nacré', 5, '1',
 'Toyota Yaris hybride automatique en excellent état. Idéale en ville et sur route, très économique. Carnet d''entretien complet. Garantie 6 mois.',
 'published', now() - interval '10 days',
 true, 1,
 ARRAY['voitures'],
 'toyota-yaris-hybride-automatique-2021',
 'Toyota Yaris Hybride 116ch Automatique 2021 — 38 500 km — 16 900 € — Garage Mendonca Drémil-Lafage (31)',
 '{"climatisation_automatique":true,"bluetooth":true,"regulateur_vitesse":true,"camera_recul":true,"ecran_tactile":true,"demarrage_sans_cle":true,"gps":true}',
 '{"nb_portes":5,"nb_places":5,"puissance_fiscale":6}'
),

-- 2. Honda CR-V Hybride — featured #2
('00000000-0000-0000-0000-000000000202',
 '00000000-0000-0000-0000-000000000001',
 'Honda', 'CR-V', 2020, 52000, 'Hybride', 'Automatique',
 184, 24500, 'Gris Métallisé', 5, '1',
 'Honda CR-V e:HEV, SUV hybride automatique, très bien équipé. Toit panoramique, sièges chauffants, GPS. Première main, 0 accident.',
 'published', now() - interval '8 days',
 true, 2,
 ARRAY['voitures', 'premium'],
 'honda-cr-v-hybride-automatique-2020',
 'Honda CR-V Hybride 184ch Automatique 2020 — 52 000 km — 24 500 € — Garage Mendonca',
 '{"toit_panoramique":true,"climatisation_automatique":true,"sieges_chauffants":true,"gps":true,"camera_recul":true,"regulateur_adaptatif":true,"jantes_alliage":true}',
 '{"nb_portes":5,"nb_places":5,"puissance_fiscale":9}'
),

-- 3. Lexus IS 300h — featured #3 — premium
('00000000-0000-0000-0000-000000000203',
 '00000000-0000-0000-0000-000000000001',
 'Lexus', 'IS 300h', 2018, 89000, 'Hybride', 'Automatique',
 223, 22800, 'Noir Obsidienne', 4, '1',
 'Lexus IS 300h hybride, berline premium automatique. Finition Executive, cuir full. Carnet d''entretien Lexus. Véhicule d''exception au prix du marché.',
 'published', now() - interval '5 days',
 true, 3,
 ARRAY['voitures', 'premium'],
 'lexus-is-300h-hybride-automatique-2018',
 'Lexus IS 300h Hybride 223ch Automatique 2018 — 89 000 km — 22 800 € — Garage Mendonca Drémil-Lafage',
 '{"climatisation_automatique":true,"toit_panoramique":true,"sieges_chauffants":true,"gps":true,"camera_recul":true,"jantes_alliage":true,"regulateur_adaptatif":true,"demarrage_sans_cle":true,"ecran_tactile":true}',
 '{"nb_portes":4,"nb_places":5,"puissance_fiscale":10}'
),

-- 4. Nissan Micra
('00000000-0000-0000-0000-000000000204',
 '00000000-0000-0000-0000-000000000001',
 'Nissan', 'Micra', 2019, 61200, 'Essence', 'Automatique',
 90, 11400, 'Rouge', 5, '2',
 'Nissan Micra boîte automatique CVT, agréable à conduire en ville. Entretien Nissan, pas d''accident, prête à rouler.',
 'published', now() - interval '15 days',
 false, NULL,
 ARRAY['voitures'],
 'nissan-micra-essence-automatique-2019',
 'Nissan Micra 90ch Automatique 2019 — 61 200 km — 11 400 € — Garage Mendonca Drémil-Lafage',
 '{"climatisation":true,"bluetooth":true,"regulateur_vitesse":true}',
 '{"nb_portes":5,"nb_places":5,"puissance_fiscale":4}'
),

-- 5. Mazda CX-5 Diesel
('00000000-0000-0000-0000-000000000205',
 '00000000-0000-0000-0000-000000000001',
 'Mazda', 'CX-5', 2022, 28000, 'Diesel', 'Automatique',
 150, 27900, 'Bleu Métallisé', 5, '2',
 'Mazda CX-5 Skyactiv-D 150ch automatique, SUV familial. Finition Exclusive-Line. Garantie constructeur restante jusqu''en 2025.',
 'published', now() - interval '3 days',
 false, NULL,
 ARRAY['voitures'],
 'mazda-cx5-diesel-automatique-2022',
 'Mazda CX-5 Diesel 150ch Automatique 2022 — 28 000 km — 27 900 € — Garage Mendonca Drémil-Lafage',
 '{"climatisation_automatique":true,"camera_recul":true,"regulateur_adaptatif":true,"jantes_alliage":true,"ecran_tactile":true,"gps":true,"bluetooth":true}',
 '{"nb_portes":5,"nb_places":5,"puissance_fiscale":8}'
),

-- 6. Toyota Corolla Hybride
('00000000-0000-0000-0000-000000000206',
 '00000000-0000-0000-0000-000000000001',
 'Toyota', 'Corolla', 2023, 18500, 'Hybride', 'Automatique',
 140, 26900, 'Gris Magnétique', 5, '1',
 'Toyota Corolla hybride 2023, quasi-neuve. 18 500 km seulement. Garantie constructeur active jusqu''en 2026. Finition Active + Tech. Toutes les aides à la conduite.',
 'published', now() - interval '2 days',
 true, 4,
 ARRAY['voitures'],
 'toyota-corolla-hybride-automatique-2023',
 'Toyota Corolla Hybride 140ch Automatique 2023 — 18 500 km — 26 900 € — Garage Mendonca',
 '{"climatisation_automatique":true,"camera_recul":true,"regulateur_adaptatif":true,"bluetooth":true,"ecran_tactile":true,"demarrage_sans_cle":true,"sieges_chauffants":true,"jantes_alliage":true}',
 '{"nb_portes":5,"nb_places":5,"puissance_fiscale":7}'
),

-- 7. Suzuki Swift Sport
('00000000-0000-0000-0000-000000000207',
 '00000000-0000-0000-0000-000000000001',
 'Suzuki', 'Swift Sport', 2019, 54000, 'Essence', 'Manuelle',
 140, 14900, 'Blanc Nacré', 3, '2',
 'Suzuki Swift Sport en parfait état. 140ch, 0 à 100 en 8,1s. Entretien complet, carnet tamponné. Véhicule pétillant et économique.',
 'published', now() - interval '20 days',
 false, NULL,
 ARRAY['voitures'],
 'suzuki-swift-sport-essence-2019',
 'Suzuki Swift Sport 140ch 2019 — 54 000 km — 14 900 € — Garage Mendonca Drémil-Lafage',
 '{"climatisation":true,"bluetooth":true,"camera_recul":true,"ecran_tactile":true,"jantes_alliage":true}',
 '{"nb_portes":3,"nb_places":4,"puissance_fiscale":6}'
)

ON CONFLICT (id) DO NOTHING;

-- ── Véhicule vendu ────────────────────────────────────────────────
INSERT INTO vehicles (
  id, garage_id, brand, model, year, mileage, fuel, transmission,
  power, price, color, doors, status, sold_at, categories, slug
) VALUES
('00000000-0000-0000-0000-000000000208',
 '00000000-0000-0000-0000-000000000001',
 'Honda', 'Jazz', 2021, 31000, 'Hybride', 'Automatique',
 109, 18500, 'Gris Platine', 5,
 'sold', now() - interval '5 days',
 ARRAY['voitures'],
 'honda-jazz-hybride-automatique-2021'
)
ON CONFLICT (id) DO NOTHING;

-- ── Véhicules brouillons ──────────────────────────────────────────
INSERT INTO vehicles (
  id, garage_id, brand, model, year, mileage, fuel, transmission,
  power, price, color, doors, status, categories, slug
) VALUES
('00000000-0000-0000-0000-000000000209',
 '00000000-0000-0000-0000-000000000001',
 'Toyota', 'RAV4', 2020, 74000, 'Hybride', 'Automatique',
 218, 29900, 'Gris', 5,
 'draft', ARRAY['voitures'],
 'toyota-rav4-hybride-automatique-2020'
),
('00000000-0000-0000-0000-000000000210',
 '00000000-0000-0000-0000-000000000001',
 'Lexus', 'UX 250h', 2022, 42000, 'Hybride', 'Automatique',
 184, 31500, 'Bronze', 5,
 'draft', ARRAY['voitures', 'premium'],
 'lexus-ux-250h-hybride-automatique-2022'
)
ON CONFLICT (id) DO NOTHING;

-- ── Services ──────────────────────────────────────────────────────
INSERT INTO services (
  id, garage_id, slug, sort_order, title, icon,
  short_description, long_description, features, is_active
) VALUES

-- 1. Entretien & Révision
('00000000-0000-0000-0000-000000000301',
 '00000000-0000-0000-0000-000000000001',
 'entretien', 0, 'Entretien & Révision', 'wrench',
 'Service de proximité toutes marques. Vidange, filtres, freins, climatisation — préconisations constructeur respectées.',
 'Depuis 2001, le Garage Mendonca assure l''entretien de tous les véhicules avec un service de proximité et une qualité constante. Spécialistes des marques japonaises (Toyota, Nissan, Suzuki, Honda, Mazda…) et des boîtes automatiques. Les préconisations constructeur sont toujours respectées.',
 ARRAY[
   'Vidange huile moteur & remplacement filtres',
   'Révision garantie constructeur',
   'Remplacement courroie de distribution',
   'Préparation contrôle technique',
   'Pneus toutes marques — équipement Facom',
   'Climatisation — recharge, filtre pollen',
   'Changement d''amortisseurs',
   'Disques, plaquettes de freins & batterie'
 ],
 true
),

-- 2. Boîte Automatique
('00000000-0000-0000-0000-000000000302',
 '00000000-0000-0000-0000-000000000001',
 'boite-automatique', 1, 'Boîte Automatique', 'settings',
 'Spécialiste boîte automatique et CVT depuis 2001 — vidange ATF, réparation, échange standard.',
 'La boîte automatique est notre spécialité historique depuis 2001. Nous intervenons sur toutes les technologies : boîtes hydrauliques, CVT, DSG/DCT, e-CVT hybrides (Toyota, Honda, Lexus…). Vidange à l''intervalle constructeur, remplacement sur échange standard ou neuf.',
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

-- 3. Mécanique & Électronique
('00000000-0000-0000-0000-000000000303',
 '00000000-0000-0000-0000-000000000001',
 'mecanique', 2, 'Mécanique & Électronique', 'cpu',
 'Spécialiste véhicules japonais. Réparation moteur, embrayage, suspension. Diagnostic électronique — devis avant intervention.',
 'À la fois généraliste et expert, le Garage Mendonca intervient sur l''entretien courant comme sur les réparations les plus techniques. Spécialistes des véhicules japonais et des boîtes automatiques, nos mécaniciens assurent le meilleur service avec devis systématique avant travaux.',
 ARRAY[
   'Réparation moteur, embrayage & boîte de vitesses',
   'Suspensions, direction et amortisseurs',
   'Réparation pièces électroniques automobiles',
   'Spécialiste japonaises — boîte automatique',
   'Mise au point moteur',
   'Diagnostic toutes marques',
   'Devis pièce & main-d''œuvre avant intervention',
   'Véhicule de prêt disponible'
 ],
 true
),

-- 4. Carrosserie & Peinture
('00000000-0000-0000-0000-000000000304',
 '00000000-0000-0000-0000-000000000001',
 'carrosserie', 3, 'Carrosserie & Peinture', 'paintbrush',
 'Nouvelle cabine de peinture. Tôlerie, collision, pare-brise toutes marques. Dossier assurance pris en charge.',
 'Le Garage Mendonca a investi dans une toute nouvelle cabine de peinture pour des finitions irréprochables. Spécialisé dans les petits travaux de tôlerie et la simple collision, toutes marques. Remplacement de pare-brise et lunette arrière. Véhicule de courtoisie disponible, dossier assurance pris en charge intégralement.',
 ARRAY[
   'Tôlerie, peinture, réparation plastiques',
   'Pare-brise & lunette arrière',
   'Rénovation optiques et phares',
   'Prise en charge véhicule grêlé',
   'Dossier assurance & expertise sinistre',
   'Véhicule de courtoisie disponible',
   'Nettoyage intérieur & extérieur inclus'
 ],
 true
),

-- 5. Vente de véhicules
('00000000-0000-0000-0000-000000000305',
 '00000000-0000-0000-0000-000000000001',
 'vente-vehicules', 4, 'Vente de Véhicules', 'car',
 'Véhicules d''occasion soigneusement sélectionnés, révisés et garantis 6 à 12 mois. Financement et reprise.',
 'Notre sélection de véhicules d''occasion est inspectée en 160 points, révisée par nos mécaniciens et garantie 6 à 12 mois kilométrage illimité. Spécialistes des véhicules japonais à boîte automatique. Financement sur mesure et reprise de votre véhicule.',
 ARRAY[
   'Contrôle 160 points systématique',
   'Révision complète avant mise en vente',
   'Garantie 6 à 12 mois — kilométrage illimité',
   'Spécialité : japonaises boîte automatique',
   'Financement sur mesure (LOA, crédit)',
   'Reprise & estimation gratuite',
   '250–500 km parcourus avant vente'
 ],
 true
)

ON CONFLICT (garage_id, slug) DO NOTHING;

-- ── Bannières ─────────────────────────────────────────────────────

INSERT INTO banners (
  id, garage_id, is_active, message, sub_message,
  cta_label, cta_url, bg_color, display_pages, is_dismissible,
  scheduled_start, scheduled_end
) VALUES

-- Bannière 1 : active (offre printemps)
('00000000-0000-0000-0000-000000000401',
 '00000000-0000-0000-0000-000000000001',
 true,
 'Vidange boîte automatique — Offre Printemps 2025',
 'Révision complète + vidange boîte automatique à tarif préférentiel. Sur rendez-vous uniquement.',
 'Prendre rendez-vous',
 '/contact',
 '#991B1B',
 'all',
 true,
 NULL, NULL
),

-- Bannière 2 : inactive (été, planifiée pour plus tard)
('00000000-0000-0000-0000-000000000402',
 '00000000-0000-0000-0000-000000000001',
 false,
 'Contrôle technique offert — Été 2025',
 'Pour tout achat d''un véhicule du stock, contrôle technique remboursé. Offre du 1er juillet au 31 août.',
 'Voir nos véhicules',
 '/vehicules',
 '#0f172a',
 'home_only',
 true,
 '2025-07-01 00:00:00+00', '2025-08-31 23:59:59+00'
),

-- Bannière 3 : inactive (information générale)
('00000000-0000-0000-0000-000000000403',
 '00000000-0000-0000-0000-000000000001',
 false,
 'Fermeture annuelle du 11 au 25 août 2025',
 'Le garage sera fermé du 11 au 25 août. Pour toute urgence, contactez-nous par email.',
 'Nous contacter',
 '/contact',
 '#1e3a5f',
 'all',
 false,
 '2025-08-01 00:00:00+00', '2025-08-25 23:59:59+00'
)

ON CONFLICT (id) DO NOTHING;

-- ── Messages de contact ───────────────────────────────────────────
INSERT INTO messages (id, garage_id, vehicle_id, name, email, phone, subject, message, status, read_at)
VALUES

('00000000-0000-0000-0000-000000000501',
 '00000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000201',
 'Jean-Pierre Durand', 'jp.durand@email.fr', '06 12 34 56 78',
 'Renseignement véhicule',
 'Bonjour, je suis intéressé par la Toyota Yaris Hybride 2021. Est-elle encore disponible ? Peut-on organiser un essai cette semaine ? Merci.',
 'new', NULL
),

('00000000-0000-0000-0000-000000000502',
 '00000000-0000-0000-0000-000000000001',
 NULL,
 'Sophie Martin', 'sophie.martin@gmail.com', NULL,
 'Demande de devis réparation',
 'Bonjour, j''aurais besoin d''un devis pour la vidange de la boîte automatique de ma Honda Jazz 2019. Quels sont vos tarifs ?',
 'new', NULL
),

('00000000-0000-0000-0000-000000000503',
 '00000000-0000-0000-0000-000000000001',
 NULL,
 'Marc Leblanc', 'marc.leblanc@outlook.com', '07 98 76 54 32',
 'Prise de rendez-vous',
 'Je souhaite prendre rendez-vous pour la révision de mon véhicule la semaine prochaine. Avez-vous des disponibilités mardi ou mercredi matin ?',
 'read', now() - interval '1 day'
),

('00000000-0000-0000-0000-000000000504',
 '00000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000203',
 'Isabelle Petit', 'i.petit@yahoo.fr', '06 55 44 33 22',
 'Renseignement véhicule',
 'Bonjour, j''aimerais en savoir plus sur le Lexus IS 300h. Peut-on organiser un essai ? Est-ce que la garantie est transférable ? Merci d''avance.',
 'read', now() - interval '3 days'
),

('00000000-0000-0000-0000-000000000505',
 '00000000-0000-0000-0000-000000000001',
 NULL,
 'Thomas Nguyen', 'thomas.n@protonmail.com', NULL,
 'Demande d''information',
 'Bonjour, est-ce que vous acceptez la reprise de mon ancien véhicule lors de l''achat d''une voiture chez vous ? Si oui, comment ça se passe et avez-vous un formulaire d''estimation en ligne ?',
 'new', NULL
)

ON CONFLICT (id) DO NOTHING;
