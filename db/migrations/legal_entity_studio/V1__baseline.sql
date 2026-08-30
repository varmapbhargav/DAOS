-- ============================================================
-- Legal Entity Structuring — baseline schema (V1)
-- Schema: legal_entity_studio
-- ============================================================

SET search_path TO legal_entity_studio;
SELECT set_config('search_path', 'legal_entity_studio,pg_catalog', false);

-- ─── Legal Entities ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS legal_entities (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id          UUID        NOT NULL,
  legal_name         TEXT        NOT NULL,
  entity_type        TEXT        NOT NULL,
  jurisdiction       TEXT        NOT NULL,
  status             TEXT        NOT NULL DEFAULT 'forming'
                                  CHECK (status IN ('forming','active','dissolved','suspended')),
  registered_agent   JSONB,
  beneficial_owners  JSONB       NOT NULL DEFAULT '[]',
  hierarchy          JSONB       NOT NULL DEFAULT '{}',
  document_ids       JSONB       NOT NULL DEFAULT '[]',
  formation_ref      TEXT,
  dissolution_reason TEXT,
  version            INTEGER     NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_legal_entities_tenant_id ON legal_entities (tenant_id);

-- ─── Corporate Documents ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS corporate_documents (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID        NOT NULL,
  entity_id    UUID        NOT NULL,
  doc_type     TEXT        NOT NULL,
  file_ref     TEXT        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','partiallyExecuted','fullyExecuted')),
  signatories  JSONB       NOT NULL DEFAULT '[]',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version      INTEGER     NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_corporate_documents_tenant_id ON corporate_documents (tenant_id);
CREATE INDEX idx_corporate_documents_entity_id ON corporate_documents (entity_id);

-- ─── Outbox ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outbox_events (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID,
  aggregate_id   TEXT        NOT NULL,
  event_type     TEXT        NOT NULL,
  payload        JSONB       NOT NULL,
  schema_version INTEGER     NOT NULL DEFAULT 1,
  correlation_id TEXT,
  causation_id   TEXT,
  occurred_at    TIMESTAMPTZ NOT NULL,
  dispatched_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outbox_undispatched ON outbox_events (created_at)
  WHERE dispatched_at IS NULL;

-- ─── Idempotency keys ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key         TEXT        PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Row-Level Security ──────────────────────────────────────────────────
ALTER TABLE legal_entities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_documents  ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_legal_entities ON legal_entities
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_corporate_documents ON corporate_documents
  USING (tenant_id = current_tenant_id());
