-- ─────────────────────────────────────────────────────────────────
--  Migration 023 — CRM upgrade (rattrapage de 014 jamais appliquée)
--
--  014_crm_upgrade.sql n'a jamais été exécutée en production :
--    - tentait ALTER TYPE message_status qui n'existe pas (status = TEXT)
--    - colonnes CRM absentes : firstname, lastname, is_read,
--      admin_notes, answered_at, updated_at
--    - contact_replies inexistante
--
--  Cette migration est entièrement idempotente (IF NOT EXISTS / IF EXISTS).
-- ─────────────────────────────────────────────────────────────────

-- 1. Étendre la contrainte CHECK de status pour les nouveaux statuts CRM
--    La contrainte actuelle n'autorisait que 'new','read','archived'.
ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_status_check;

ALTER TABLE messages
  ADD CONSTRAINT messages_status_check
  CHECK (status IN ('new','read','in_progress','answered','archived'));

-- 2. Nouvelles colonnes CRM sur messages
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS firstname   VARCHAR(100) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS lastname    VARCHAR(100) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS answered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now();

-- 3. Backfill firstname / lastname depuis name
UPDATE messages
SET
  firstname = TRIM(split_part(name, ' ', 1)),
  lastname  = TRIM(substr(name, strpos(name, ' ') + 1))
WHERE firstname = '' AND name IS NOT NULL AND name != '';

-- 4. Remap statut legacy 'read' → 'in_progress'
UPDATE messages SET status = 'in_progress' WHERE status = 'read';

-- 5. Synchroniser is_read avec read_at existant
UPDATE messages SET is_read = TRUE WHERE read_at IS NOT NULL;

-- 6. Fonction + trigger updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_updated_at ON messages;
CREATE TRIGGER messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 7. Table contact_replies
CREATE TABLE IF NOT EXISTS contact_replies (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  UUID        NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  garage_id   UUID        REFERENCES garages(id) ON DELETE SET NULL,
  sender_type TEXT        NOT NULL CHECK (sender_type IN ('admin', 'client')),
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Index performance
CREATE INDEX IF NOT EXISTS contact_replies_message_id_idx ON contact_replies (message_id);
CREATE INDEX IF NOT EXISTS messages_is_read_idx           ON messages (garage_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS messages_status_garage_idx     ON messages (garage_id, status);

-- 9. RLS contact_replies
ALTER TABLE contact_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "garage_members_manage_replies" ON contact_replies;
CREATE POLICY "garage_members_manage_replies"
  ON contact_replies FOR ALL TO authenticated
  USING (garage_id IN (
    SELECT garage_id FROM garage_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "anon_insert_reply" ON contact_replies;
CREATE POLICY "anon_insert_reply"
  ON contact_replies FOR INSERT TO anon
  WITH CHECK (
    sender_type = 'client'
    AND length(content) >= 5
    AND length(content) <= 5000
  );

-- 10. Grants
GRANT SELECT, INSERT ON contact_replies TO anon;
GRANT ALL           ON contact_replies TO authenticated;
GRANT ALL           ON contact_replies TO service_role;
