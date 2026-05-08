-- ═══════════════════════════════════════════════════════════════════
--  seed.sql — Garage Auto Mendonca — Données démo validées client
--
--  Prérequis : schema.sql exécuté (ou migrations 001 → 006).
--  Idempotent : ON CONFLICT (id) DO UPDATE — écrase les seeds
--  incorrects issus des migrations 003 / 004.
--
--  UUIDs fixes :
--    Garage      : 00000000-0000-0000-0000-000000000001
--    Services    : ...0301 (entretien) | ...0302 (mecanique) | ...0303 (carrosserie)
--    Testimonials: ...0401 (Patrick L.) | ...0402 (Isabelle M.) | ...0403 (Laurent B.)
--    Gallery     : ...0501 → ...0505
--    Vehicles    : ...0201 (Suzuki Swift) | ...0202 (Toyota AYGO)
--                  ...0203 (Nissan Micra) | ...0204 (Nissan Pixo)
--                  ...0205 (Mitsubishi Space Star) | ...0206 (Hyundai i10)
--                  ...0207 (Peugeot 107) | ...0208 (Citroën C1)
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. GARAGE ────────────────────────────────────────────────────
INSERT INTO garages (
  id, name, slug, address, city, postal_code, phone, email,
  plan, lat, lng, description, is_active, google_maps_url, opening_hours,
  content, seo_title, seo_description, seo_keywords
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Garage Auto Mendonca',
  'garage-mendonca',
  '6 Avenue de la Mouyssaguese',
  'Drémil-Lafage',
  '31280',
  '05 32 00 20 38',
  'contact@garagemendonca.com',
  'isolated',
  43.604652,
  1.567890,
  'Spécialiste de la mécanique, carrosserie et vente de véhicules d''occasion japonais à boîte automatique à Drémil-Lafage depuis 2001.',
  true,
  'https://maps.google.com/?q=6+Avenue+de+la+Mouyssaguese+31280+Dr%C3%A9mil-Lafage',
  '{"lundi":{"open":"08:00","close":"19:00"},"mardi":{"open":"08:00","close":"19:00"},"mercredi":{"open":"08:00","close":"19:00"},"jeudi":{"open":"08:00","close":"19:00"},"vendredi":{"open":"08:00","close":"18:00"},"samedi":null,"dimanche":null}',
  jsonb_build_object(
    'hero', jsonb_build_object(
      'eyebrow',            'Garage Mendonca – Expert auto depuis 2001',
      'h1_prefix',          'Votre garage de confiance à',
      'h1_city',            'Drémil-Lafage',
      'subtitle',           'Mécaniciens qualifiés, équipement dernière génération, devis transparent avant toute intervention. Spécialiste japonaises et boîte automatique depuis 2001. Jeunes conducteurs, seniors & PMR bienvenus.',
      'h3_prefix',          'Spécialiste',
      'h3_highlight',       'japonaises et coréennes',
      'cta_primary_text',   'Nous contacter',
      'cta_primary_href',   'tel:0532002038',
      'cta_secondary_text', 'Demander un devis gratuit',
      'cta_secondary_href', '/contact',
      'stats', jsonb_build_array(
        jsonb_build_object('value', '30+',    'label', 'Ans d''expérience'),
        jsonb_build_object('value', '2 000+', 'label', 'Réparations réalisées'),
        jsonb_build_object('value', '98 %',   'label', 'Clients satisfaits')
      ),
      'trust_badges', jsonb_build_array(
        jsonb_build_object('icon', 'shield-check', 'text', 'Devis pièce & main-d''œuvre avant toute intervention'),
        jsonb_build_object('icon', 'clock',        'text', 'Accueil avec ou sans rendez-vous'),
        jsonb_build_object('icon', 'award',        'text', 'Spécialiste japonaises · boîte automatique')
      )
    ),
    'reassurances', jsonb_build_array(
      jsonb_build_object(
        'label',       'Depuis 2001',
        'description', 'Plus de 20 ans au service des conducteurs de la région toulousaine.'
      ),
      jsonb_build_object(
        'label',       'Spécialiste japonaises & boîtes auto',
        'description', 'Toyota, Nissan, Honda, Suzuki, Mazda — boîte automatique incluse.'
      ),
      jsonb_build_object(
        'label',       'Devis transparent avant intervention',
        'description', 'Prix pièce et main-d''œuvre communiqué systématiquement avant tout travail.'
      ),
      jsonb_build_object(
        'label',       '98 % de clients satisfaits',
        'description', 'Accueil avec ou sans rendez-vous, service fiable et bienveillant.'
      )
    ),
    'cta_section', jsonb_build_object(
      'h2_prefix',    'Besoin d''une réparation',
      'h2_highlight', 'rapide et fiable ?',
      'paragraph',    'Contactez-nous par téléphone ou via notre formulaire.',
      'guarantees', jsonb_build_array(
        'Devis 100% gratuit',
        'Réponse sous 24h',
        'Avec ou sans RDV',
        'Prix transparents'
      )
    ),
    'vehicle_guarantees', jsonb_build_array(
      jsonb_build_object('icon', 'clipboard-check', 'label', 'Contrôle technique récent'),
      jsonb_build_object('icon', 'wrench',          'label', 'Révision complète effectuée'),
      jsonb_build_object('icon', 'book-open',       'label', 'Carnet d''entretien vérifié'),
      jsonb_build_object('icon', 'shield-check',    'label', 'Garantie 6 à 12 mois km illimités')
    )
  ),
  'Garage Auto Mendonca — Garagiste Drémil-Lafage (31) — Mécanique, Carrosserie, Vente',
  'Garage auto à Drémil-Lafage (31) — Mécanique, carrosserie, diagnostic et vente VO depuis 2001. Spécialiste japonaises, boîte automatique. Diagnostic en 10 min, devis gratuit. ☎ 05 32 00 20 38.',
  ARRAY[
    'garage automobile Drémil-Lafage',
    'garagiste Toulouse',
    'réparation voiture 31',
    'mécanique japonaises boîte automatique',
    'carrosserie peinture',
    'diagnostic OBD',
    'occasions boîte automatique',
    'devis gratuit mécanique',
    'contrôle technique',
    'filtre à particules DPF'
  ]
) ON CONFLICT (id) DO UPDATE SET
  name            = EXCLUDED.name,
  slug            = EXCLUDED.slug,
  address         = EXCLUDED.address,
  city            = EXCLUDED.city,
  postal_code     = EXCLUDED.postal_code,
  phone           = EXCLUDED.phone,
  email           = EXCLUDED.email,
  plan            = EXCLUDED.plan,
  lat             = EXCLUDED.lat,
  lng             = EXCLUDED.lng,
  description     = EXCLUDED.description,
  is_active       = EXCLUDED.is_active,
  google_maps_url = EXCLUDED.google_maps_url,
  opening_hours   = EXCLUDED.opening_hours,
  content         = EXCLUDED.content,
  seo_title       = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  seo_keywords    = EXCLUDED.seo_keywords;


-- ── 2. SERVICES (entretien, mecanique, carrosserie) ───────────────
INSERT INTO services (
  id, garage_id, slug, sort_order, title, icon,
  short_description, long_description, features, is_active, show_on_homepage,
  steps, pricing, faq, testimonials
) VALUES

-- ── 2.1 Entretien & Révision ─────────────────────────────────────
(
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000001',
  'entretien', 1,
  'Entretien & Révision',
  'wrench',
  'Service de proximité pour tous véhicules toutes marques. Préconisations constructeur toujours respectées.',
  'Depuis 2001, le Garage Mendonca assure l''entretien de tous les véhicules avec un service de proximité et une qualité constante. Spécialistes des marques japonaises (Toyota, Nissan, Suzuki, Honda, Mazda…) et des boîtes automatiques. Accueil adapté aux jeunes conducteurs, seniors et personnes à mobilité réduite. Les préconisations constructeur sont toujours respectées.',
  ARRAY[
    'Vidange huile moteur & remplacement filtres',
    'Révision garantie constructeur',
    'Remplacement courroie de distribution',
    'Préparation contrôle technique',
    'Pneus toutes marques — équipement Facom',
    'Climatisation — recharge, filtre pollen, traitement antibactérien',
    'Changement d''amortisseurs toutes marques',
    'Remplacement disques, plaquettes de freins & batterie'
  ],
  true, true,
  '[{"order":1,"title":"Dépôt du véhicule","description":"Sans rendez-vous ou sur rendez-vous. Accueil en atelier dès 8h."},{"order":2,"title":"Diagnostic offert","description":"Bilan visuel complet et lecture des codes défaut en 10 minutes."},{"order":3,"title":"Devis transparent","description":"Présentation du devis pièce et main-d''œuvre avant toute intervention."},{"order":4,"title":"Travaux","description":"Réalisés selon les préconisations constructeur, pièces qualifiées."},{"order":5,"title":"Restitution","description":"Test sur route, nettoyage du véhicule, facturation détaillée."}]',
  '[{"label":"Vidange + filtre huile","price":"à partir de 79 € TTC"},{"label":"Révision complète","price":"à partir de 149 € TTC"},{"label":"Courroie de distribution","price":"à partir de 299 € TTC"},{"label":"Contrôle technique","price":"Sur devis","note":"Préparation incluse"},{"label":"Recharge climatisation","price":"à partir de 99 € TTC"},{"label":"4 pneus posés équilibrés","price":"Sur devis","note":"Toutes marques"}]',
  '[{"question":"Mon véhicule est-il trop ancien pour être entretenu chez vous ?","answer":"Non. Nous intervenons sur tous les véhicules toutes marques, quels que soient leur âge ou leur kilométrage. Nous sommes spécialisés dans les japonaises et les boîtes automatiques, mais nous accueillons toutes les marques."},{"question":"Puis-je avoir un devis avant l''intervention ?","answer":"Oui, c''est systématique. Nous ne commençons aucun travail sans votre accord écrit sur le devis. Prix pièce et main-d''œuvre détaillés à l''avance."},{"question":"Avez-vous des véhicules de prêt ?","answer":"Oui, jusqu''à 9 véhicules de prêt sont disponibles (sous réserve de disponibilité) pour que vous puissiez continuer vos déplacements pendant l''intervention."},{"question":"L''entretien fait chez vous est-il compatible avec la garantie constructeur ?","answer":"Oui. Nous respectons strictement les préconisations constructeur et utilisons des pièces de qualité équivalente OEM. L''entretien n''invalide pas votre garantie constructeur."}]',
  '[{"author":"Laurent M.","location":"Drémil-Lafage","date":"janvier 2025","rating":5,"content":"Vidange + révision faite en 1h30 chrono, devis respecté au centime. Je reviens depuis 4 ans, jamais de mauvaise surprise."},{"author":"Sophie V.","location":"Montrabé","date":"mars 2025","rating":5,"content":"Ils m''ont prêté un véhicule pendant 2 jours pour la révision complète. Accueil très agréable, travail sérieux et propre."},{"author":"Ahmed B.","location":"Toulouse","date":"novembre 2024","rating":5,"content":"Courroie de distribution changée sur ma Toyota. Devis clair, pas de surprise. Je recommande vivement."}]'
),

-- ── 2.2 Réparation Mécanique & Électronique ───────────────────────
(
  '00000000-0000-0000-0000-000000000302',
  '00000000-0000-0000-0000-000000000001',
  'mecanique', 2,
  'Réparation Mécanique & Électronique',
  'settings',
  'Spécialiste véhicules japonais et boîtes automatiques. Réparation électronique à coût maîtrisé, devis avant intervention.',
  'À la fois généraliste et expert, le Garage Mendonca intervient sur l''entretien courant comme sur les réparations les plus techniques. Spécialistes des véhicules japonais (Toyota, Nissan, Suzuki, Honda…) et des boîtes automatiques, nos mécaniciens qualifiés assurent le meilleur service. Réparation de pièces électroniques automobiles à coût maîtrisé.',
  ARRAY[
    'Réparation moteur, embrayage & boîte de vitesses',
    'Suspensions, direction et amortisseurs',
    'Réparation pièces électroniques automobiles',
    'Spécialiste japonaises · boîte automatique',
    'Réparation boîte de vitesse automatique',
    'Mise au point moteur',
    'Devis pièce & main-d''œuvre avant toute intervention',
    'Véhicule de prêt disponible'
  ],
  true, true,
  '[{"order":1,"title":"Prise en charge","description":"Accueil de votre véhicule et description du problème constaté."},{"order":2,"title":"Diagnostic électronique","description":"Lecture des codes défaut OBD en 10 minutes, bilan des actionneurs."},{"order":3,"title":"Devis pièce & main-d''œuvre","description":"Chiffrage détaillé avant de commencer — aucun frais caché."},{"order":4,"title":"Réparation","description":"Intervention par nos mécaniciens qualifiés, spécialistes japonaises & boîtes auto."},{"order":5,"title":"Contrôle final","description":"Essai sur route, vérification complète et restitution du véhicule propre."}]',
  '[{"label":"Diagnostic OBD","price":"Offert","note":"En moins de 10 min"},{"label":"Embrayage","price":"Sur devis","note":"Toutes marques"},{"label":"Révision boîte automatique","price":"Sur devis"},{"label":"Réparation électronique","price":"Sur devis","note":"À coût maîtrisé"},{"label":"Mise au point moteur","price":"Sur devis"},{"label":"Suspensions complètes","price":"Sur devis"}]',
  '[{"question":"Êtes-vous vraiment spécialisés dans les boîtes automatiques ?","answer":"Oui, c''est notre expertise principale depuis 2001. Nous réalisons des vidanges de boîtes automatiques, des révisions complètes et des réparations de boîtes CVT, DSG et conventionnelles sur toutes marques japonaises."},{"question":"Pouvez-vous réparer des pièces électroniques sans les remplacer ?","answer":"Dans de nombreux cas, oui. Nous sommes équipés pour réparer des calculateurs, des modules de confort et d''autres composants électroniques à un coût bien inférieur au remplacement."},{"question":"Intervenez-vous sur toutes les marques ou seulement les japonaises ?","answer":"Nous intervenons sur toutes les marques. Notre expertise poussée sur les japonaises (Toyota, Nissan, Suzuki, Honda, Mazda, Mitsubishi) nous permet d''aller plus loin sur ces modèles, mais nous sommes pleinement équipés pour les européennes et les coréennes."},{"question":"Combien de temps dure une réparation mécanique ?","answer":"Cela dépend de la réparation. Un diagnostic prend 10 minutes. Une réparation courante (embrayage, boîte auto) prend généralement 1 à 2 jours. Un véhicule de prêt est disponible si besoin."}]',
  '[{"author":"Pierre D.","location":"Balma","date":"février 2025","rating":5,"content":"Boîte automatique révisée sur ma Nissan Micra. Diagnostic rapide, tarif raisonnable, véhicule de prêt fourni. Tout roule depuis 8 000 km."},{"author":"Fatima R.","location":"Toulouse","date":"décembre 2024","rating":5,"content":"Réparation calculateur évitée grâce à leur expertise en électronique. 3 fois moins cher que chez le concessionnaire. Très professionnel."}]'
),

-- ── 2.3 Carrosserie, Vitrage & Services ──────────────────────────
(
  '00000000-0000-0000-0000-000000000303',
  '00000000-0000-0000-0000-000000000001',
  'carrosserie', 3,
  'Carrosserie, Vitrage & Services',
  'paintbrush',
  'Nouvelle cabine de peinture. Tôlerie, collision, pare-brise toutes marques. Véhicule de courtoisie inclus.',
  'Le Garage Mendonca a investi dans une toute nouvelle cabine de peinture pour des finitions irréprochables. Spécialisé dans les petits travaux de tôlerie et la simple collision, toutes marques. Remplacement de pare-brise et lunette arrière pour particuliers et utilitaires. Véhicule de courtoisie disponible, dossier assurance pris en charge intégralement.',
  ARRAY[
    'Tôlerie, peinture, réparation plastiques — cabine neuve',
    'Pare-brise & lunette arrière (particuliers et utilitaires)',
    'Rénovation optiques et phares',
    'Prise en charge véhicule grêlé',
    'Dossier assurance & expertise sinistre',
    'Véhicule de courtoisie (gratuit ou 16 € HT/j)',
    'Location de véhicules (déménagements, déplacements pro)',
    'Nettoyage intérieur & extérieur inclus après carrosserie'
  ],
  true, true,
  '[{"order":1,"title":"Évaluation du sinistre","description":"Inspection visuelle et photos du dommage, prise en charge du dossier assurance si besoin."},{"order":2,"title":"Expertise & chiffrage","description":"Devis détaillé transmis à votre assurance ou directement pour les petites réparations."},{"order":3,"title":"Prise en charge","description":"Remise du véhicule de courtoisie, début des travaux en cabine de peinture."},{"order":4,"title":"Carrosserie & peinture","description":"Tôlerie, redressage, peinture en cabine climatisée — finition irréprochable."},{"order":5,"title":"Restitution","description":"Nettoyage intérieur et extérieur complet, restitution du véhicule comme neuf."}]',
  '[{"label":"Petite bosse / éraflure","price":"Sur devis","note":"Dès 90 € selon dommage"},{"label":"Pare-brise","price":"Sur devis","note":"Prise en charge assurance possible"},{"label":"Lunette arrière","price":"Sur devis"},{"label":"Véhicule de courtoisie","price":"Gratuit ou 16 € HT/j","note":"Selon durée"},{"label":"Location utilitaire","price":"Sur devis","note":"Déménagement, déplacements pro"},{"label":"Nettoyage après carrosserie","price":"Inclus"}]',
  '[{"question":"Prenez-vous en charge le dossier assurance ?","answer":"Oui, intégralement. Nous gérons les démarches avec votre assurance, de l''expertise au règlement, sans que vous ayez à vous en occuper."},{"question":"Ma voiture est grêlée, pouvez-vous la réparer ?","answer":"Oui, c''est une spécialité de notre atelier. Nous traitons les véhicules grêlés en débosselage sans peinture (PDR) ou en peinture complète selon l''étendue des dommages."},{"question":"Intervenez-vous sur les pare-brise de tous les véhicules ?","answer":"Oui, pare-brise et lunettes arrière toutes marques, particuliers et utilitaires. Nous pouvons prendre en charge votre assurance pare-brise si vous en disposez."},{"question":"Faut-il prendre rendez-vous pour un devis carrosserie ?","answer":"Non, vous pouvez vous présenter directement. Nous évaluons le dommage sur place et vous remettons un devis immédiatement ou sous 24h pour les cas complexes."}]',
  '[{"author":"Nathalie C.","location":"Drémil-Lafage","date":"mars 2025","rating":5,"content":"Pare-brise remplacé en 2h, dossier assurance géré par le garage. Rien à faire de mon côté, impeccable."},{"author":"Julien P.","location":"Quint-Fonsegrives","date":"janvier 2025","rating":5,"content":"Carrosserie avant refaite après un choc. Peinture parfaite, on ne voit plus rien. Véhicule rendu propre à l''intérieur aussi."},{"author":"Marie-Hélène T.","location":"Toulouse","date":"novembre 2024","rating":4,"content":"Très bien pour les petites bosses. Devis clair, délai respecté. Véhicule de prêt fourni sans supplément."}]'
)

ON CONFLICT (garage_id, slug) DO UPDATE SET
  sort_order        = EXCLUDED.sort_order,
  title             = EXCLUDED.title,
  icon              = EXCLUDED.icon,
  short_description = EXCLUDED.short_description,
  long_description  = EXCLUDED.long_description,
  features          = EXCLUDED.features,
  is_active         = EXCLUDED.is_active,
  show_on_homepage  = EXCLUDED.show_on_homepage,
  steps             = EXCLUDED.steps,
  pricing           = EXCLUDED.pricing,
  faq               = EXCLUDED.faq,
  testimonials      = EXCLUDED.testimonials;


-- ── 3. TESTIMONIALS (texte exact de Testimonials.tsx) ────────────
INSERT INTO testimonials (
  id, garage_id, author, initials, location, rating, date_label, comment, color, sort_order, is_active
) VALUES
(
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000001',
  'Patrick L.', 'PL', 'Toulouse', 5, 'Juillet 2024',
  'Après l''allumage de 3 voyants sur mon BMW X5, le diagnostic BMW préconisait une boîte de transfert à 2 000 € HT. M. Mendonca a trouvé un kit réparation servomoteur à 103 € seulement, en se battant pour obtenir la pièce au détail. Depuis, le diagnostic est vierge.',
  'bg-blue-600', 0, true
),
(
  '00000000-0000-0000-0000-000000000402',
  '00000000-0000-0000-0000-000000000001',
  'Isabelle M.', 'IM', 'Drémil-Lafage', 5, 'Novembre 2024',
  'M. Mendonca est très consciencieux. Il est intervenu sur mon véhicule et a réalisé plusieurs réparations consécutives. Il se donne la peine de tout vous expliquer, de manière claire et transparente. Je recommande sans hésiter.',
  'bg-emerald-600', 1, true
),
(
  '00000000-0000-0000-0000-000000000403',
  '00000000-0000-0000-0000-000000000001',
  'Laurent B.', 'LB', 'Quint-Fonsegrives', 5, 'Septembre 2024',
  'Véhicule de courtoisie mis à disposition pendant toute la réparation. Carrosserie refaite avec la cabine de peinture neuve, résultat impeccable. Franchise offerte et dossier assurance pris en charge. Service 5 étoiles.',
  'bg-violet-600', 2, true
)
ON CONFLICT (id) DO UPDATE SET
  author     = EXCLUDED.author,
  initials   = EXCLUDED.initials,
  location   = EXCLUDED.location,
  rating     = EXCLUDED.rating,
  date_label = EXCLUDED.date_label,
  comment    = EXCLUDED.comment,
  color      = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  is_active  = EXCLUDED.is_active;


-- ── 4. GARAGE GALLERY (photos de GalleryAtelier.tsx) ─────────────
INSERT INTO garage_gallery (
  id, garage_id, url, alt, caption, span, sort_order, is_active
) VALUES
(
  '00000000-0000-0000-0000-000000000501',
  '00000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80',
  'Mécanicien au travail sur un moteur',
  'Atelier mécanique',
  'lg:col-span-2 lg:row-span-2',
  0, true
),
(
  '00000000-0000-0000-0000-000000000502',
  '00000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
  'Véhicule sur pont élévateur',
  'Pont élévateur',
  '',
  1, true
),
(
  '00000000-0000-0000-0000-000000000503',
  '00000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
  'Diagnostic électronique automobile',
  'Diagnostic électronique',
  '',
  2, true
),
(
  '00000000-0000-0000-0000-000000000504',
  '00000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&q=80',
  'Outils de mécanique professionnels',
  'Outillage professionnel',
  '',
  3, true
),
(
  '00000000-0000-0000-0000-000000000505',
  '00000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
  'Atelier automobile équipé',
  'Espace de travail',
  '',
  4, true
)
ON CONFLICT (id) DO UPDATE SET
  url        = EXCLUDED.url,
  alt        = EXCLUDED.alt,
  caption    = EXCLUDED.caption,
  span       = EXCLUDED.span,
  sort_order = EXCLUDED.sort_order,
  is_active  = EXCLUDED.is_active;


-- ── 5. VEHICLES ───────────────────────────────────────────────────

-- ── 5.1 Suzuki Swift 2018 (featured #1) ──────────────────────────
INSERT INTO vehicles (
  id, garage_id, brand, model, year, mileage, fuel, transmission,
  power, price, color, doors, crit_air, status, published_at,
  featured, featured_order, slug, meta_description,
  description, features, options, images
) VALUES (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000001',
  'Suzuki', 'Swift', 2018, 68500, 'Essence', 'Automatique',
  110, 11200, 'Speedy Blue (ZWG)', 5, '2',
  'published', '2026-03-20T00:00:00Z',
  true, 1,
  'suzuki-swift-automatique-2018',
  'Suzuki Swift Comfort+ 110ch Automatique 2018 — 68 500 km — 11 200 € — Garage Mendonca Drémil-Lafage (31)',
  'Suzuki Swift 2018 avec 68 500 km. Finition Comfort+ et couleur Speedy Blue (ZWG). Moteur 110 ch (6cv) avec boîte automatique.

Garantie : 6 mois complète couvrant l''ensemble des composants mécaniques et électroniques.

Mécanique : Carnet d''entretien tamponné SUZUKI
- 16/08/2019 : 14 631 km
- 24/08/2020 : 25 037 km
- 27/09/2021 : 31 366 km
- 19/10/2022 : 38 602 km
- 21/11/2023 : 48 478 km
- Entretien réalisé pour la vente à 68 250 km

Carrosserie : Très bon état général. Photos supplémentaires et vidéo en cours de préparation.

Autres notes : Véhicule en cours de roulage. Idéal pour la ville et pour jeunes permis en boîte automatique.',
  '{"Finition":"Comfort+","Motorisation":"1.0i 110 ch BoosterJet","Provenance":"Francaise","Carnet d''entretien":"À jour","Contrôle technique":"À jour","Garantie":"6 mois complète"}',
  '{"abs":true,"esp":true,"airbags":true,"airbags_lateraux":true,"aide_freinage_urgence":true,"isofix":true,"regulateur_adaptatif":true,"regulateur_vitesse":true,"freinage_automatique":true,"alerte_franchissement_ligne":true,"feux_automatiques":true,"camera_recul":true,"jantes_alliage":true,"taille_jantes":16,"vitres_surteintees":true,"feux_led":true,"retroviseurs_electriques":true,"retroviseurs_degivrants":true,"climatisation_automatique":true,"sieges_chauffants":true,"volant_cuir":true,"volant_reglable":true,"demarrage_sans_cle":true,"ouverture_sans_cle":true,"vitres_electriques_avant":true,"vitres_electriques_arriere":true,"ecran_tactile":true,"bluetooth":true,"usb":true,"prise_12v":true,"boite_automatique":true,"start_stop":true}',
  ARRAY[
    'https://www.garagemendonca.com/public/img/big/20260313134541Copierjpg_69b7b050aaa46.jpg',
    'https://www.garagemendonca.com/public/img/big/20260313135600Copierjpg_69b7b0500daac.jpg',
    'https://www.garagemendonca.com/public/img/big/20260313134700Copierjpg_69b7b05054e68.jpg',
    'https://www.garagemendonca.com/public/img/big/20260313134736Copierjpg_69b7b05039a17.jpg',
    'https://www.garagemendonca.com/public/img/big/20260313135309Copierjpg_69b7b05080440.jpg',
    'https://www.garagemendonca.com/public/img/big/20260313134926Copierjpg_69b7b04fe5e1c.jpg',
    'https://www.garagemendonca.com/public/img/big/20260313134443Copierjpg_69b7b04fc7a77.jpg',
    'https://www.garagemendonca.com/public/img/big/20260313135536Copierjpg_69b7b050d5569.jpg'
  ]
) ON CONFLICT (id) DO UPDATE SET
  brand            = EXCLUDED.brand,
  model            = EXCLUDED.model,
  year             = EXCLUDED.year,
  mileage          = EXCLUDED.mileage,
  fuel             = EXCLUDED.fuel,
  transmission     = EXCLUDED.transmission,
  power            = EXCLUDED.power,
  price            = EXCLUDED.price,
  color            = EXCLUDED.color,
  doors            = EXCLUDED.doors,
  crit_air         = EXCLUDED.crit_air,
  status           = EXCLUDED.status,
  published_at     = EXCLUDED.published_at,
  featured         = EXCLUDED.featured,
  featured_order   = EXCLUDED.featured_order,
  slug             = EXCLUDED.slug,
  meta_description = EXCLUDED.meta_description,
  description      = EXCLUDED.description,
  features         = EXCLUDED.features,
  options          = EXCLUDED.options,
  images           = EXCLUDED.images;

-- ── 5.2 Toyota AYGO 2020 (featured #2) ───────────────────────────
INSERT INTO vehicles (
  id, garage_id, brand, model, year, mileage, fuel, transmission,
  power, price, color, doors, crit_air, status, published_at,
  featured, featured_order, slug, meta_description,
  description, features, options, images
) VALUES (
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000001',
  'Toyota', 'AYGO', 2020, 32000, 'Essence', 'Automatique',
  68, 9900, 'Blanc', 5, '2',
  'published', '2025-11-30T00:00:00Z',
  true, 2,
  'toyota-aygo-automatique-2020',
  'Toyota AYGO X-Play 68ch Automatique 2020 — 32 000 km — 9 900 € — Garage Mendonca Drémil-Lafage (31)',
  'Toyota AYGO boîte automatique, Crit''Air 2. Idéale en ville, très économique. Vérifiée en 160 points, 250 km parcourus avant mise en vente. Garantie 6 à 12 mois kilométrages illimités. Révision boîte automatique effectuée.',
  '{"Finition":"X-Play","Motorisation":"1.0 VVT-i 68 ch","Provenance":"Francaise","Carnet d''entretien":"À jour","Contrôle technique":"À jour","Garantie":"6 à 12 mois km illimités","Nb propriétaires":"1"}',
  '{"abs":true,"esp":true,"airbags":true,"airbags_lateraux":true,"isofix":true,"climatisation":true,"vitres_electriques_avant":true,"fermeture_centralisee":true,"sieges_rabattables":true,"bluetooth":true,"usb":true,"boite_automatique":true,"start_stop":true}',
  ARRAY[
    'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80'
  ]
) ON CONFLICT (id) DO UPDATE SET
  brand            = EXCLUDED.brand,
  model            = EXCLUDED.model,
  year             = EXCLUDED.year,
  mileage          = EXCLUDED.mileage,
  fuel             = EXCLUDED.fuel,
  transmission     = EXCLUDED.transmission,
  power            = EXCLUDED.power,
  price            = EXCLUDED.price,
  color            = EXCLUDED.color,
  doors            = EXCLUDED.doors,
  crit_air         = EXCLUDED.crit_air,
  status           = EXCLUDED.status,
  published_at     = EXCLUDED.published_at,
  featured         = EXCLUDED.featured,
  featured_order   = EXCLUDED.featured_order,
  slug             = EXCLUDED.slug,
  meta_description = EXCLUDED.meta_description,
  description      = EXCLUDED.description,
  features         = EXCLUDED.features,
  options          = EXCLUDED.options,
  images           = EXCLUDED.images;

-- ── 5.3 Nissan Micra 2019 (featured #3) ──────────────────────────
INSERT INTO vehicles (
  id, garage_id, brand, model, year, mileage, fuel, transmission,
  power, price, color, doors, crit_air, status, published_at,
  featured, featured_order, slug, meta_description,
  description, features, options, images
) VALUES (
  '00000000-0000-0000-0000-000000000203',
  '00000000-0000-0000-0000-000000000001',
  'Nissan', 'Micra', 2019, 48000, 'Essence', 'Automatique',
  88, 10500, 'Gris Métallisé', 5, '2',
  'published', '2025-12-15T00:00:00Z',
  true, 3,
  'nissan-micra-automatique-2019',
  'Nissan Micra Acenta 88ch Automatique 2019 — 48 000 km — 10 500 € — Garage Mendonca Drémil-Lafage (31)',
  'Nissan Micra 1.4 88 ch Acenta, boîte automatique, Crit''Air 2. Véhicule francais, bien entretenu, carnet à jour. Vérification en 160 points, 250 km parcourus avant mise en vente. Garantie 6 à 12 mois km illimités. Révision boîte automatique incluse.',
  '{"Finition":"Acenta","Motorisation":"1.4 88 ch","Provenance":"Francaise","Carnet d''entretien":"À jour","Contrôle technique":"À jour","Garantie":"6 à 12 mois km illimités","Nb propriétaires":"1"}',
  '{"abs":true,"esp":true,"airbags":true,"airbags_lateraux":true,"detection_pression_pneus":true,"isofix":true,"regulateur_vitesse":true,"limiteur_vitesse":true,"camera_recul":true,"radar_arriere":true,"jantes_alliage":true,"taille_jantes":16,"feux_led":true,"retroviseurs_electriques":true,"climatisation_automatique":true,"vitres_electriques_avant":true,"vitres_electriques_arriere":true,"fermeture_centralisee":true,"commande_au_volant":true,"sieges_rabattables":true,"ecran_tactile":true,"bluetooth":true,"usb":true,"boite_automatique":true,"start_stop":true}',
  ARRAY[
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80',
    'https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?w=800&q=80'
  ]
) ON CONFLICT (id) DO UPDATE SET
  brand            = EXCLUDED.brand,
  model            = EXCLUDED.model,
  year             = EXCLUDED.year,
  mileage          = EXCLUDED.mileage,
  fuel             = EXCLUDED.fuel,
  transmission     = EXCLUDED.transmission,
  power            = EXCLUDED.power,
  price            = EXCLUDED.price,
  color            = EXCLUDED.color,
  doors            = EXCLUDED.doors,
  crit_air         = EXCLUDED.crit_air,
  status           = EXCLUDED.status,
  published_at     = EXCLUDED.published_at,
  featured         = EXCLUDED.featured,
  featured_order   = EXCLUDED.featured_order,
  slug             = EXCLUDED.slug,
  meta_description = EXCLUDED.meta_description,
  description      = EXCLUDED.description,
  features         = EXCLUDED.features,
  options          = EXCLUDED.options,
  images           = EXCLUDED.images;

-- ── 5.4 Nissan Pixo 2017 (featured #4) ───────────────────────────
INSERT INTO vehicles (
  id, garage_id, brand, model, year, mileage, fuel, transmission,
  power, price, color, doors, crit_air, status, published_at,
  featured, featured_order, slug, meta_description,
  description, features, options, images
) VALUES (
  '00000000-0000-0000-0000-000000000204',
  '00000000-0000-0000-0000-000000000001',
  'Nissan', 'Pixo', 2017, 65000, 'Essence', 'Automatique',
  68, 7900, 'Argent', 5, '2',
  'published', '2026-02-05T00:00:00Z',
  true, 4,
  'nissan-pixo-automatique-2017',
  'Nissan Pixo Acenta 68ch Automatique 2017 — 65 000 km — 7 900 € — Garage Mendonca Drémil-Lafage (31)',
  'Nissan Pixo 1.0i 68 ch Acenta, boîte automatique, 1ère main. Petite citadine très maniable, faible consommation. Entretien complet réalisé par notre atelier. Garantie 6 à 12 mois km illimités, vérification 160 points.',
  '{"Finition":"Acenta","Motorisation":"1.0i 68 ch","Provenance":"Francaise","Nb propriétaires":"1","Carnet d''entretien":"À jour","Contrôle technique":"À jour","Garantie":"6 à 12 mois km illimités"}',
  '{"abs":true,"esp":true,"airbags":true,"climatisation":true,"vitres_electriques_avant":true,"fermeture_centralisee":true,"sieges_rabattables":true,"boite_automatique":true,"start_stop":true}',
  ARRAY[
    'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80',
    'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&q=80'
  ]
) ON CONFLICT (id) DO UPDATE SET
  brand            = EXCLUDED.brand,
  model            = EXCLUDED.model,
  year             = EXCLUDED.year,
  mileage          = EXCLUDED.mileage,
  fuel             = EXCLUDED.fuel,
  transmission     = EXCLUDED.transmission,
  power            = EXCLUDED.power,
  price            = EXCLUDED.price,
  color            = EXCLUDED.color,
  doors            = EXCLUDED.doors,
  crit_air         = EXCLUDED.crit_air,
  status           = EXCLUDED.status,
  published_at     = EXCLUDED.published_at,
  featured         = EXCLUDED.featured,
  featured_order   = EXCLUDED.featured_order,
  slug             = EXCLUDED.slug,
  meta_description = EXCLUDED.meta_description,
  description      = EXCLUDED.description,
  features         = EXCLUDED.features,
  options          = EXCLUDED.options,
  images           = EXCLUDED.images;

-- ── 5.5 Mitsubishi Space Star 2014 (not featured) ─────────────────
INSERT INTO vehicles (
  id, garage_id, brand, model, year, mileage, fuel, transmission,
  power, price, color, doors, crit_air, status, published_at,
  featured, slug, meta_description,
  description, features, options, images
) VALUES (
  '00000000-0000-0000-0000-000000000205',
  '00000000-0000-0000-0000-000000000001',
  'Mitsubishi', 'Space Star', 2014, 79900, 'Essence', 'Automatique',
  80, 9990, 'Non précisé', 5, '2',
  'published', '2026-02-25T00:00:00Z',
  false,
  'mitsubishi-space-star-automatique-2014',
  'Mitsubishi Space Star TOP 80ch Automatique 2014 — 79 900 km — 9 990 € — Garage Mendonca Drémil-Lafage (31)',
  'Mitsubishi Space Star 1.2i 80 ch TOP / Boîte Automatique & 1ère Main !

Notre enseigne met en vente ce magnifique véhicule qui possède 79 900 kms du 14/10/2014. Il possède la finition TOP. Moteur 80 ch (5cv) associé à une boîte automatique.

Ce véhicule bénéficie d''une garantie de 6 mois complète, couvrant tous les composants mécaniques et électroniques, comme un véhicule neuf.

Carrosserie : Bon état général. Photos supplémentaires et vidéo en cours de préparation.

Autres notes : Véhicule en cours de roulage, idéal pour la ville et jeunes permis en boîte automatique.',
  '{"Finition":"TOP","Motorisation":"1.2i 80 ch","Provenance":"Non précisé","Carnet d''entretien":"À jour","Contrôle technique":"À jour","Garantie":"6 mois complète"}',
  '{"jantes_alliage":true,"feux_automatiques":true,"retroviseurs_electriques":true,"vitres_electriques_avant":true,"vitres_electriques_arriere":true,"fermeture_centralisee":true,"ouverture_sans_cle":true,"demarrage_sans_cle":true,"climatisation_automatique":true,"sieges_chauffants":true,"commande_au_volant":true,"sieges_rabattables":true,"essuie_glaces_automatiques":true,"bluetooth":true,"prise_12v":true,"regulateur_vitesse":true,"boite_automatique":true}',
  ARRAY[
    'https://www.garagemendonca.com/public/img/big/20251031153752Copierjpg_6904f66ac72c3.jpg',
    'https://www.garagemendonca.com/public/img/big/20251031154515Copierjpg_6904f67d5ad63.jpg',
    'https://www.garagemendonca.com/public/img/big/20251031154945Copierjpg_6904f67db91b5.jpg',
    'https://www.garagemendonca.com/public/img/big/20251031154558Copierjpg_6904f67deabc4.jpg',
    'https://www.garagemendonca.com/public/img/big/20251031153950Copierjpg_6904f67d3a012.jpg',
    'https://www.garagemendonca.com/public/img/big/20251031155012Copierjpg_6904f67d7c715.jpg',
    'https://www.garagemendonca.com/public/img/big/20251031153647Copierjpg_6904f66a8b49d.jpg',
    'https://www.garagemendonca.com/public/img/big/20251031154750Copierjpg_6904f66b3be56.jpg',
    'https://www.garagemendonca.com/public/img/big/20251031154413Copierjpg_6904f66b07179.jpg'
  ]
) ON CONFLICT (id) DO UPDATE SET
  brand            = EXCLUDED.brand,
  model            = EXCLUDED.model,
  year             = EXCLUDED.year,
  mileage          = EXCLUDED.mileage,
  fuel             = EXCLUDED.fuel,
  transmission     = EXCLUDED.transmission,
  power            = EXCLUDED.power,
  price            = EXCLUDED.price,
  color            = EXCLUDED.color,
  doors            = EXCLUDED.doors,
  crit_air         = EXCLUDED.crit_air,
  status           = EXCLUDED.status,
  published_at     = EXCLUDED.published_at,
  featured         = EXCLUDED.featured,
  slug             = EXCLUDED.slug,
  meta_description = EXCLUDED.meta_description,
  description      = EXCLUDED.description,
  features         = EXCLUDED.features,
  options          = EXCLUDED.options,
  images           = EXCLUDED.images;

-- ── 5.6 Hyundai i10 2018 (sold) ───────────────────────────────────
INSERT INTO vehicles (
  id, garage_id, brand, model, year, mileage, fuel, transmission,
  power, price, color, doors, crit_air, status, sold_at,
  featured, slug, meta_description,
  description, features, options, images
) VALUES (
  '00000000-0000-0000-0000-000000000206',
  '00000000-0000-0000-0000-000000000001',
  'Hyundai', 'i10', 2018, 58000, 'Essence', 'Automatique',
  67, 8900, 'Blanc', 5, '2',
  'sold', '2026-03-10T00:00:00Z',
  false,
  'hyundai-i10-automatique-2018',
  'Hyundai i10 67ch Automatique 2018 — 58 000 km — 8 900 € — Garage Mendonca Drémil-Lafage (31)',
  'Hyundai i10 boîte automatique. Légère, économique et facile à garer. Parfaite pour la ville et les trajets courts. Véhicule contrôlé et révisé par notre atelier, prêt à rouler. Garantie 6 à 12 mois km illimités.',
  '{"Motorisation":"1.0i 67 ch","Provenance":"Francaise","Carnet d''entretien":"À jour","Contrôle technique":"À jour","Garantie":"6 à 12 mois km illimités"}',
  '{"abs":true,"esp":true,"airbags":true,"airbags_lateraux":true,"isofix":true,"climatisation_automatique":true,"vitres_electriques_avant":true,"fermeture_centralisee":true,"commande_au_volant":true,"sieges_rabattables":true,"bluetooth":true,"usb":true,"boite_automatique":true,"start_stop":true}',
  ARRAY[
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    'https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=800&q=80'
  ]
) ON CONFLICT (id) DO UPDATE SET
  brand            = EXCLUDED.brand,
  model            = EXCLUDED.model,
  year             = EXCLUDED.year,
  mileage          = EXCLUDED.mileage,
  fuel             = EXCLUDED.fuel,
  transmission     = EXCLUDED.transmission,
  power            = EXCLUDED.power,
  price            = EXCLUDED.price,
  color            = EXCLUDED.color,
  doors            = EXCLUDED.doors,
  crit_air         = EXCLUDED.crit_air,
  status           = EXCLUDED.status,
  sold_at          = EXCLUDED.sold_at,
  featured         = EXCLUDED.featured,
  slug             = EXCLUDED.slug,
  meta_description = EXCLUDED.meta_description,
  description      = EXCLUDED.description,
  features         = EXCLUDED.features,
  options          = EXCLUDED.options,
  images           = EXCLUDED.images;

-- ── 5.7 Peugeot 107 2007 (featured #5) ───────────────────────────
INSERT INTO vehicles (
  id, garage_id, brand, model, year, mileage, fuel, transmission,
  power, price, color, doors, crit_air, status, published_at,
  featured, featured_order, slug, meta_description,
  description, features, options, images
) VALUES (
  '00000000-0000-0000-0000-000000000207',
  '00000000-0000-0000-0000-000000000001',
  'Peugeot', '107', 2007, 76500, 'Essence', 'Automatique',
  68, 6500, 'Gris Gallium (KTB)', 5, '2',
  'published', '2026-03-01T00:00:00Z',
  true, 5,
  'peugeot-107-automatique-2007',
  'Peugeot 107 Trendy 68ch Automatique 2007 — 76 500 km — 6 500 € — Garage Mendonca Drémil-Lafage (31)',
  'Peugeot 107 1.0i 68 ch finition Trendy, boîte automatique à 5 rapports, mise en circulation le 07/06/2007 avec 76 500 km. Couleur Gris Gallium (KTB).

Garantie : 6 mois complète couvrant l''ensemble des composants mécaniques et électroniques.

Mécanique : Entretien réalisé pour la vente
- Révision complète (huile, filtres, bougies)
- Révision de la boîte automatique
- Remplacement de 2 pneus avant
- Disques et plaquettes de frein avant

Carrosserie : Bon état général. Photos supplémentaires et vidéo disponibles prochainement.

Autres notes : Véhicule en cours de roulage. Idéal pour la ville et pour jeune permis en boîte automatique.',
  '{"finition":"Trendy","motorisation":"1.0i 68 ch (4cv)","provenance":"Française","carnetEntretien":"Entretien à jour","controleTechnique":"À jour","garantie":"6 mois complète"}',
  '{"abs":true,"airbags":true,"vitres_electriques_avant":true,"fermeture_centralisee":true,"sieges_rabattables":true,"prise_12v":true,"boite_automatique":true}',
  ARRAY[
    'https://www.garagemendonca.com/public/img/big/20251119144533Copierjpg_691ee9050666b.jpg',
    'https://www.garagemendonca.com/public/img/big/20251119144426Copierjpg_691ee904ca3a1.jpg',
    'https://www.garagemendonca.com/public/img/big/20251119144630Copierjpg_691ee90535b65.jpg',
    'https://www.garagemendonca.com/public/img/big/20251119144718Copierjpg_691ee9047e6b4.jpg',
    'https://www.garagemendonca.com/public/img/big/20251119144802Copierjpg_691ee905772c2.jpg',
    'https://www.garagemendonca.com/public/img/big/20251119144650Copierjpg_691ee904a2301.jpg'
  ]
) ON CONFLICT (id) DO UPDATE SET
  brand            = EXCLUDED.brand,
  model            = EXCLUDED.model,
  year             = EXCLUDED.year,
  mileage          = EXCLUDED.mileage,
  fuel             = EXCLUDED.fuel,
  transmission     = EXCLUDED.transmission,
  power            = EXCLUDED.power,
  price            = EXCLUDED.price,
  color            = EXCLUDED.color,
  doors            = EXCLUDED.doors,
  crit_air         = EXCLUDED.crit_air,
  status           = EXCLUDED.status,
  published_at     = EXCLUDED.published_at,
  featured         = EXCLUDED.featured,
  featured_order   = EXCLUDED.featured_order,
  slug             = EXCLUDED.slug,
  meta_description = EXCLUDED.meta_description,
  description      = EXCLUDED.description,
  features         = EXCLUDED.features,
  options          = EXCLUDED.options,
  images           = EXCLUDED.images;

-- ── 5.8 Citroën C1 2020 (not featured, published) ─────────────────
INSERT INTO vehicles (
  id, garage_id, brand, model, year, mileage, fuel, transmission,
  power, price, color, doors, crit_air, status, published_at,
  featured, slug, meta_description,
  description, features, options, images
) VALUES (
  '00000000-0000-0000-0000-000000000208',
  '00000000-0000-0000-0000-000000000001',
  'Citroën', 'C1', 2020, 22000, 'Hybride', 'Automatique',
  72, 10900, 'Gris', 5, '2',
  'published', '2026-03-18T00:00:00Z',
  false,
  'citroen-c1-automatique-2020',
  'Citroën C1 72ch Automatique 2020 — 22 000 km — 10 900 € — Garage Mendonca Drémil-Lafage (31)',
  'Citroën C1 boîte automatique. En cours de préparation, disponible prochainement.',
  '{"Motorisation":"1.2i 72 ch","Provenance":"Francaise","Garantie":"6 à 12 mois km illimités"}',
  '{"abs":true,"esp":true,"airbags":true,"isofix":true,"climatisation":true,"vitres_electriques_avant":true,"fermeture_centralisee":true,"commande_au_volant":true,"bluetooth":true,"usb":true,"boite_automatique":true,"start_stop":true}',
  ARRAY[
    'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80'
  ]
) ON CONFLICT (id) DO UPDATE SET
  brand            = EXCLUDED.brand,
  model            = EXCLUDED.model,
  year             = EXCLUDED.year,
  mileage          = EXCLUDED.mileage,
  fuel             = EXCLUDED.fuel,
  transmission     = EXCLUDED.transmission,
  power            = EXCLUDED.power,
  price            = EXCLUDED.price,
  color            = EXCLUDED.color,
  doors            = EXCLUDED.doors,
  crit_air         = EXCLUDED.crit_air,
  status           = EXCLUDED.status,
  published_at     = EXCLUDED.published_at,
  featured         = EXCLUDED.featured,
  slug             = EXCLUDED.slug,
  meta_description = EXCLUDED.meta_description,
  description      = EXCLUDED.description,
  features         = EXCLUDED.features,
  options          = EXCLUDED.options,
  images           = EXCLUDED.images;
