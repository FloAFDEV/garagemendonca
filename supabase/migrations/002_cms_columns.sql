-- ═══════════════════════════════════════════════════════════════════
--  002_cms_columns.sql — Garage Auto Mendonca — Colonnes CMS
--
--  Sûr à ré-exécuter (ADD COLUMN IF NOT EXISTS).
--  Zéro breaking change : aucun DROP, aucun RENAME.
--  Supabase Dashboard > SQL Editor > Run.
--
--  Périmètre :
--    • garages.content      JSONB — hero / stats / badges / CTA / reassurances
--    • garages.seo_title    text  — <title> site-level
--    • garages.seo_description text
--    • garages.seo_keywords text[]
--    • garages.og_image_url text  — URL image Open Graph
--    • services.show_on_homepage boolean
--
--  Après exécution, les nouvelles colonnes sont disponibles immédiatement.
--  Le frontend continue de fonctionner sans modification : les colonnes
--  ne sont pas lues tant que les composants ne sont pas branchés.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Ajouts sur la table garages ───────────────────────────────

ALTER TABLE garages
  ADD COLUMN IF NOT EXISTS content          jsonb    NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS seo_title        text,
  ADD COLUMN IF NOT EXISTS seo_description  text,
  ADD COLUMN IF NOT EXISTS seo_keywords     text[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS og_image_url     text;

-- ── 2. Ajout sur la table services ───────────────────────────────
--  DEFAULT true → tous les services existants restent visibles en homepage.

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS show_on_homepage boolean NOT NULL DEFAULT true;

-- ── 3. Indexes sur les nouvelles colonnes ────────────────────────

-- Index partiel : seuls les services actifs ET affichés en homepage
-- sont concernés par la requête ServicesOverview.
CREATE INDEX IF NOT EXISTS idx_services_homepage
  ON services(garage_id, is_active, sort_order)
  WHERE show_on_homepage = true AND is_active = true;

-- ── 4. Population initiale : garages.content ─────────────────────
--
--  Idempotent : s'exécute uniquement si la clé 'hero' est absente.
--  Encode les valeurs actuellement hardcodées dans les composants
--  Hero.tsx, ServicesOverview.tsx, CallToAction.tsx, vehicules/page.tsx.
--
--  Structure du JSONB :
--    content.hero            → Hero.tsx
--    content.reassurances    → ServicesOverview.tsx
--    content.cta_section     → CallToAction.tsx
--    content.vehicle_guarantees → app/vehicules/page.tsx

UPDATE garages
SET content = jsonb_build_object(

  -- ── hero ────────────────────────────────────────────────────────
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
      jsonb_build_object('value', '30+',     'label', 'Ans d''expérience'),
      jsonb_build_object('value', '2 000+',  'label', 'Réparations réalisées'),
      jsonb_build_object('value', '98 %',    'label', 'Clients satisfaits')
    ),
    'trust_badges', jsonb_build_array(
      jsonb_build_object('icon', 'shield-check', 'text', 'Devis pièce & main-d''œuvre avant toute intervention'),
      jsonb_build_object('icon', 'clock',        'text', 'Accueil avec ou sans rendez-vous'),
      jsonb_build_object('icon', 'award',        'text', 'Spécialiste japonaises · boîte automatique')
    )
  ),

  -- ── reassurances (ServicesOverview) ─────────────────────────────
  'reassurances', jsonb_build_array(
    jsonb_build_object(
      'label', 'Depuis 2001',
      'description', 'Plus de 20 ans au service des conducteurs de la région toulousaine.'
    ),
    jsonb_build_object(
      'label', 'Spécialiste japonaises & boîtes auto',
      'description', 'Toyota, Nissan, Honda, Suzuki, Mazda — boîte automatique incluse.'
    ),
    jsonb_build_object(
      'label', 'Devis transparent avant intervention',
      'description', 'Prix pièce et main-d''œuvre communiqué systématiquement avant tout travail.'
    ),
    jsonb_build_object(
      'label', '98 % de clients satisfaits',
      'description', 'Accueil avec ou sans rendez-vous, service fiable et bienveillant.'
    )
  ),

  -- ── cta_section (CallToAction.tsx) ──────────────────────────────
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

  -- ── vehicle_guarantees (app/vehicules/page.tsx) ──────────────────
  'vehicle_guarantees', jsonb_build_array(
    jsonb_build_object('icon', 'clipboard-check', 'label', 'Contrôle technique récent'),
    jsonb_build_object('icon', 'wrench',          'label', 'Révision complète effectuée'),
    jsonb_build_object('icon', 'book-open',       'label', 'Carnet d''entretien vérifié'),
    jsonb_build_object('icon', 'shield-check',    'label', 'Garantie 6 à 12 mois km illimités')
  )

)
WHERE id = '00000000-0000-0000-0000-000000000001'
  AND NOT (content ? 'hero');

-- ── 5. Population initiale : garages SEO ─────────────────────────
--  Idempotent : s'exécute uniquement si seo_title est NULL.

UPDATE garages
SET
  seo_title       = 'Garage Auto Mendonca — Garagiste Drémil-Lafage (31) — Mécanique, Carrosserie, Vente',
  seo_description = 'Garage auto à Drémil-Lafage (31) — Mécanique, carrosserie, diagnostic et vente VO depuis 2001. Spécialiste japonaises, boîte automatique. Diagnostic en 10 min, devis gratuit. ☎ 05 32 00 20 38.',
  seo_keywords    = ARRAY[
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
  ],
  og_image_url    = NULL  -- à renseigner quand /opengraph-image.png est créé
WHERE id = '00000000-0000-0000-0000-000000000001'
  AND seo_title IS NULL;
