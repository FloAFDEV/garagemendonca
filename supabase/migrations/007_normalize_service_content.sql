-- ═══════════════════════════════════════════════════════════════════
--  007_normalize_service_content.sql — Garage Auto Mendonca
--
--  PHASE 1 — Normalisation additive, zéro breaking change.
--
--  Ce que cette migration fait :
--    A. Nouvelles tables relationnelles (garages content)
--    B. Nouvelles tables relationnelles (services content)
--    C. Extension de testimonials avec service_id nullable
--    D. Peuplement depuis JSONB existants (idempotent)
--    E. Indexes + RLS sur toutes les nouvelles tables
--
--  Ce que cette migration NE fait PAS :
--    • Aucun DROP de colonne JSONB existante
--    • Aucune modification des RLS existantes
--    • Aucune modification des FK existantes
--    • Aucune perte de données
--
--  Idempotent : sûr à ré-exécuter.
-- ═══════════════════════════════════════════════════════════════════


-- ══════════════════════════════════════════════════════════════════
--  A. GARAGE CONTENT — remplacement des sous-clés de garages.content
-- ══════════════════════════════════════════════════════════════════

-- ── A1. garage_content (textes marketing hero + CTA — 1:1 garage) ─
CREATE TABLE IF NOT EXISTS garage_content (
  id                       uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id                uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  -- Hero
  hero_eyebrow             text,
  hero_h1_prefix           text,
  hero_h1_city             text,
  hero_subtitle            text,
  hero_h3_prefix           text,
  hero_h3_highlight        text,
  hero_cta_primary_text    text,
  hero_cta_primary_href    text,
  hero_cta_secondary_text  text,
  hero_cta_secondary_href  text,
  -- CTA section
  cta_h2_prefix            text,
  cta_h2_highlight         text,
  cta_paragraph            text,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uniq_garage_content UNIQUE (garage_id)
);

-- ── A2. garage_stats ({value, label} — ex: "30+", "Ans d'expérience") ─
CREATE TABLE IF NOT EXISTS garage_stats (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id  uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  value      text        NOT NULL,
  label      text        NOT NULL,
  sort_order smallint    NOT NULL DEFAULT 0,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── A3. garage_trust_badges ({icon, text}) ───────────────────────
CREATE TABLE IF NOT EXISTS garage_trust_badges (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id  uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  icon       text        NOT NULL,
  text       text        NOT NULL,
  sort_order smallint    NOT NULL DEFAULT 0,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── A4. garage_reassurances ({label, description}) ───────────────
CREATE TABLE IF NOT EXISTS garage_reassurances (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id   uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  label       text        NOT NULL,
  description text,
  sort_order  smallint    NOT NULL DEFAULT 0,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── A5. garage_cta_guarantees ({label} — ex: "Devis 100% gratuit") ─
CREATE TABLE IF NOT EXISTS garage_cta_guarantees (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id  uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  label      text        NOT NULL,
  sort_order smallint    NOT NULL DEFAULT 0,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── A6. garage_vehicle_guarantees ({icon, label} — page /vehicules) ─
CREATE TABLE IF NOT EXISTS garage_vehicle_guarantees (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id  uuid        NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  icon       text        NOT NULL,
  label      text        NOT NULL,
  sort_order smallint    NOT NULL DEFAULT 0,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ══════════════════════════════════════════════════════════════════
--  B. SERVICE CONTENT — remplacement de services.{steps,pricing,faq}
-- ══════════════════════════════════════════════════════════════════

-- ── B1. service_steps ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_steps (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id  uuid        NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  garage_id   uuid        NOT NULL REFERENCES garages(id)  ON DELETE CASCADE,
  sort_order  smallint    NOT NULL DEFAULT 0,
  title       text        NOT NULL,
  description text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── B2. service_pricing ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_pricing (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id uuid        NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  garage_id  uuid        NOT NULL REFERENCES garages(id)  ON DELETE CASCADE,
  sort_order smallint    NOT NULL DEFAULT 0,
  label      text        NOT NULL,
  price      text        NOT NULL,
  note       text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── B3. service_faq ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_faq (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id uuid        NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  garage_id  uuid        NOT NULL REFERENCES garages(id)  ON DELETE CASCADE,
  sort_order smallint    NOT NULL DEFAULT 0,
  question   text        NOT NULL,
  answer     text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ══════════════════════════════════════════════════════════════════
--  C. TESTIMONIALS — ajout service_id nullable
--     NULL = homepage, non-NULL = page service spécifique
-- ══════════════════════════════════════════════════════════════════

ALTER TABLE testimonials
  ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES services(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_testimonials_service
  ON testimonials(service_id) WHERE service_id IS NOT NULL;


-- ══════════════════════════════════════════════════════════════════
--  D. TRIGGERS updated_at
-- ══════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS trg_garage_content_updated_at ON garage_content;
CREATE TRIGGER trg_garage_content_updated_at
  BEFORE UPDATE ON garage_content
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ══════════════════════════════════════════════════════════════════
--  E. INDEXES
-- ══════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_garage_content_garage     ON garage_content(garage_id);
CREATE INDEX IF NOT EXISTS idx_garage_stats_garage       ON garage_stats(garage_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_garage_trust_badges_garage ON garage_trust_badges(garage_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_garage_reassurances_garage ON garage_reassurances(garage_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_garage_cta_guar_garage    ON garage_cta_guarantees(garage_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_garage_veh_guar_garage    ON garage_vehicle_guarantees(garage_id, is_active, sort_order);

CREATE INDEX IF NOT EXISTS idx_service_steps_service     ON service_steps(service_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_service_steps_garage      ON service_steps(garage_id);
CREATE INDEX IF NOT EXISTS idx_service_pricing_service   ON service_pricing(service_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_service_pricing_garage    ON service_pricing(garage_id);
CREATE INDEX IF NOT EXISTS idx_service_faq_service       ON service_faq(service_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_service_faq_garage        ON service_faq(garage_id);


-- ══════════════════════════════════════════════════════════════════
--  F. ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════

ALTER TABLE garage_content           ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_stats             ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_trust_badges      ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_reassurances      ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_cta_guarantees    ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_vehicle_guarantees ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_steps            ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_pricing          ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_faq              ENABLE ROW LEVEL SECURITY;

-- Lecture publique
DROP POLICY IF EXISTS "garage_content_public_read"    ON garage_content;
DROP POLICY IF EXISTS "garage_stats_public_read"      ON garage_stats;
DROP POLICY IF EXISTS "garage_trust_badges_read"      ON garage_trust_badges;
DROP POLICY IF EXISTS "garage_reassurances_read"      ON garage_reassurances;
DROP POLICY IF EXISTS "garage_cta_guar_read"          ON garage_cta_guarantees;
DROP POLICY IF EXISTS "garage_veh_guar_read"          ON garage_vehicle_guarantees;
DROP POLICY IF EXISTS "service_steps_public_read"     ON service_steps;
DROP POLICY IF EXISTS "service_pricing_public_read"   ON service_pricing;
DROP POLICY IF EXISTS "service_faq_public_read"       ON service_faq;

CREATE POLICY "garage_content_public_read"  ON garage_content  FOR SELECT USING (true);
CREATE POLICY "garage_stats_public_read"    ON garage_stats    FOR SELECT USING (is_active = true);
CREATE POLICY "garage_trust_badges_read"    ON garage_trust_badges FOR SELECT USING (is_active = true);
CREATE POLICY "garage_reassurances_read"    ON garage_reassurances FOR SELECT USING (is_active = true);
CREATE POLICY "garage_cta_guar_read"        ON garage_cta_guarantees FOR SELECT USING (is_active = true);
CREATE POLICY "garage_veh_guar_read"        ON garage_vehicle_guarantees FOR SELECT USING (is_active = true);
CREATE POLICY "service_steps_public_read"   ON service_steps   FOR SELECT USING (true);
CREATE POLICY "service_pricing_public_read" ON service_pricing FOR SELECT USING (true);
CREATE POLICY "service_faq_public_read"     ON service_faq     FOR SELECT USING (true);

-- Écriture admin uniquement
DROP POLICY IF EXISTS "garage_content_admin_write"    ON garage_content;
DROP POLICY IF EXISTS "garage_stats_admin_write"      ON garage_stats;
DROP POLICY IF EXISTS "garage_trust_badges_write"     ON garage_trust_badges;
DROP POLICY IF EXISTS "garage_reassurances_write"     ON garage_reassurances;
DROP POLICY IF EXISTS "garage_cta_guar_write"         ON garage_cta_guarantees;
DROP POLICY IF EXISTS "garage_veh_guar_write"         ON garage_vehicle_guarantees;
DROP POLICY IF EXISTS "service_steps_admin_write"     ON service_steps;
DROP POLICY IF EXISTS "service_pricing_admin_write"   ON service_pricing;
DROP POLICY IF EXISTS "service_faq_admin_write"       ON service_faq;

CREATE POLICY "garage_content_admin_write"  ON garage_content  FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));
CREATE POLICY "garage_stats_admin_write"    ON garage_stats    FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));
CREATE POLICY "garage_trust_badges_write"   ON garage_trust_badges FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));
CREATE POLICY "garage_reassurances_write"   ON garage_reassurances FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));
CREATE POLICY "garage_cta_guar_write"       ON garage_cta_guarantees FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));
CREATE POLICY "garage_veh_guar_write"       ON garage_vehicle_guarantees FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));
CREATE POLICY "service_steps_admin_write"   ON service_steps   FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));
CREATE POLICY "service_pricing_admin_write" ON service_pricing FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));
CREATE POLICY "service_faq_admin_write"     ON service_faq     FOR ALL TO authenticated
  USING (can_write_garage(garage_id)) WITH CHECK (can_write_garage(garage_id));


-- ══════════════════════════════════════════════════════════════════
--  G. PEUPLEMENT DEPUIS LES JSONB EXISTANTS (idempotent)
--
--  Exécuté UNIQUEMENT si les nouvelles tables sont vides.
--  Re-exécutable sans doublon grâce aux ON CONFLICT / WHERE NOT EXISTS.
-- ══════════════════════════════════════════════════════════════════

-- ── G1. garage_content depuis garages.content ────────────────────
INSERT INTO garage_content (
  garage_id,
  hero_eyebrow, hero_h1_prefix, hero_h1_city, hero_subtitle,
  hero_h3_prefix, hero_h3_highlight,
  hero_cta_primary_text, hero_cta_primary_href,
  hero_cta_secondary_text, hero_cta_secondary_href,
  cta_h2_prefix, cta_h2_highlight, cta_paragraph
)
SELECT
  g.id,
  g.content->'hero'->>'eyebrow',
  g.content->'hero'->>'h1_prefix',
  g.content->'hero'->>'h1_city',
  g.content->'hero'->>'subtitle',
  g.content->'hero'->>'h3_prefix',
  g.content->'hero'->>'h3_highlight',
  g.content->'hero'->>'cta_primary_text',
  g.content->'hero'->>'cta_primary_href',
  g.content->'hero'->>'cta_secondary_text',
  g.content->'hero'->>'cta_secondary_href',
  g.content->'cta_section'->>'h2_prefix',
  g.content->'cta_section'->>'h2_highlight',
  g.content->'cta_section'->>'paragraph'
FROM garages g
WHERE (g.content ? 'hero')
ON CONFLICT (garage_id) DO NOTHING;

-- ── G2. garage_stats depuis garages.content.hero.stats ───────────
INSERT INTO garage_stats (garage_id, value, label, sort_order)
SELECT
  g.id,
  stat->>'value',
  stat->>'label',
  (idx - 1)::smallint
FROM garages g,
     jsonb_array_elements(g.content->'hero'->'stats') WITH ORDINALITY AS t(stat, idx)
WHERE (g.content->'hero') ? 'stats'
  AND NOT EXISTS (SELECT 1 FROM garage_stats gs WHERE gs.garage_id = g.id);

-- ── G3. garage_trust_badges depuis garages.content.hero.trust_badges ─
INSERT INTO garage_trust_badges (garage_id, icon, text, sort_order)
SELECT
  g.id,
  badge->>'icon',
  badge->>'text',
  (idx - 1)::smallint
FROM garages g,
     jsonb_array_elements(g.content->'hero'->'trust_badges') WITH ORDINALITY AS t(badge, idx)
WHERE (g.content->'hero') ? 'trust_badges'
  AND NOT EXISTS (SELECT 1 FROM garage_trust_badges gtb WHERE gtb.garage_id = g.id);

-- ── G4. garage_reassurances depuis garages.content.reassurances ──
INSERT INTO garage_reassurances (garage_id, label, description, sort_order)
SELECT
  g.id,
  item->>'label',
  item->>'description',
  (idx - 1)::smallint
FROM garages g,
     jsonb_array_elements(g.content->'reassurances') WITH ORDINALITY AS t(item, idx)
WHERE (g.content ? 'reassurances')
  AND NOT EXISTS (SELECT 1 FROM garage_reassurances gr WHERE gr.garage_id = g.id);

-- ── G5. garage_cta_guarantees depuis garages.content.cta_section.guarantees ─
INSERT INTO garage_cta_guarantees (garage_id, label, sort_order)
SELECT
  g.id,
  item #>> '{}',
  (idx - 1)::smallint
FROM garages g,
     jsonb_array_elements(g.content->'cta_section'->'guarantees') WITH ORDINALITY AS t(item, idx)
WHERE (g.content->'cta_section') ? 'guarantees'
  AND NOT EXISTS (SELECT 1 FROM garage_cta_guarantees gcg WHERE gcg.garage_id = g.id);

-- ── G6. garage_vehicle_guarantees depuis garages.content.vehicle_guarantees ─
INSERT INTO garage_vehicle_guarantees (garage_id, icon, label, sort_order)
SELECT
  g.id,
  item->>'icon',
  item->>'label',
  (idx - 1)::smallint
FROM garages g,
     jsonb_array_elements(g.content->'vehicle_guarantees') WITH ORDINALITY AS t(item, idx)
WHERE (g.content ? 'vehicle_guarantees')
  AND NOT EXISTS (SELECT 1 FROM garage_vehicle_guarantees gvg WHERE gvg.garage_id = g.id);

-- ── G7. service_steps depuis services.steps ───────────────────────
INSERT INTO service_steps (service_id, garage_id, sort_order, title, description)
SELECT
  s.id,
  s.garage_id,
  COALESCE((step->>'order')::smallint, (idx - 1)::smallint),
  step->>'title',
  step->>'description'
FROM services s,
     jsonb_array_elements(s.steps) WITH ORDINALITY AS t(step, idx)
WHERE jsonb_array_length(s.steps) > 0
  AND NOT EXISTS (SELECT 1 FROM service_steps ss WHERE ss.service_id = s.id);

-- ── G8. service_pricing depuis services.pricing ───────────────────
INSERT INTO service_pricing (service_id, garage_id, sort_order, label, price, note)
SELECT
  s.id,
  s.garage_id,
  (idx - 1)::smallint,
  item->>'label',
  item->>'price',
  NULLIF(item->>'note', '')
FROM services s,
     jsonb_array_elements(s.pricing) WITH ORDINALITY AS t(item, idx)
WHERE jsonb_array_length(s.pricing) > 0
  AND NOT EXISTS (SELECT 1 FROM service_pricing sp WHERE sp.service_id = s.id);

-- ── G9. service_faq depuis services.faq ──────────────────────────
INSERT INTO service_faq (service_id, garage_id, sort_order, question, answer)
SELECT
  s.id,
  s.garage_id,
  (idx - 1)::smallint,
  item->>'question',
  item->>'answer'
FROM services s,
     jsonb_array_elements(s.faq) WITH ORDINALITY AS t(item, idx)
WHERE jsonb_array_length(s.faq) > 0
  AND NOT EXISTS (SELECT 1 FROM service_faq sf WHERE sf.service_id = s.id);

-- ── G10. testimonials depuis services.testimonials ────────────────
--  Insère les témoignages service dans la table testimonials
--  avec service_id rempli. Couleur par défaut 'bg-brand-500'.
INSERT INTO testimonials (
  garage_id, service_id,
  author, initials, location, rating, date_label, comment,
  color, sort_order, is_active
)
SELECT
  s.garage_id,
  s.id,
  item->>'author',
  -- Calcul initiales : "Laurent M." → "LM"
  upper(left(item->>'author', 1))
    || upper(left(trim(split_part(item->>'author', ' ', 2)), 1)),
  item->>'location',
  COALESCE((item->>'rating')::smallint, 5),
  item->>'date',
  item->>'content',
  'bg-brand-500',
  (idx - 1)::smallint,
  true
FROM services s,
     jsonb_array_elements(s.testimonials) WITH ORDINALITY AS t(item, idx)
WHERE jsonb_array_length(s.testimonials) > 0
  AND NOT EXISTS (
    SELECT 1 FROM testimonials t
    WHERE t.service_id = s.id
  );


-- ══════════════════════════════════════════════════════════════════
--  H. COMMENTAIRES DE DÉPRÉCIATION sur les colonnes JSONB
--     (Phase 2 : les colonnes seront vidées puis droppées
--      après migration complète du frontend)
-- ══════════════════════════════════════════════════════════════════

COMMENT ON COLUMN garages.content IS
  'DEPRECATED depuis 007 — données migrées vers garage_content, garage_stats,
   garage_trust_badges, garage_reassurances, garage_cta_guarantees,
   garage_vehicle_guarantees. Supprimer après migration frontend complète.';

COMMENT ON COLUMN services.steps IS
  'DEPRECATED depuis 007 — données migrées vers service_steps. Supprimer après migration frontend.';
COMMENT ON COLUMN services.pricing IS
  'DEPRECATED depuis 007 — données migrées vers service_pricing. Supprimer après migration frontend.';
COMMENT ON COLUMN services.faq IS
  'DEPRECATED depuis 007 — données migrées vers service_faq. Supprimer après migration frontend.';
COMMENT ON COLUMN services.testimonials IS
  'DEPRECATED depuis 007 — données migrées vers testimonials(service_id). Supprimer après migration frontend.';
