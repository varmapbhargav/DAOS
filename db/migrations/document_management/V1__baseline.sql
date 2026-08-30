-- ============================================================
-- Document Management — baseline schema (V1)
-- Schema: document_management
-- ============================================================

SET search_path TO document_management;
SELECT set_config('search_path', 'document_management,pg_catalog', false);

-- ─── Documents ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id                     UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id              UUID        NOT NULL,
  file_name              TEXT        NOT NULL,
  category               TEXT        NOT NULL
                                    CHECK (category IN ('legalAgreement','subscriptionDocument','offeringMemorandum','financialStatement','corporateRecord','regulatoryFiling','governance','other')),
  entity_ref             JSONB       NOT NULL DEFAULT '{"entityType":"issuance","entityId":""}',
  status                 TEXT        NOT NULL DEFAULT 'uploaded'
                                    CHECK (status IN ('uploaded','archived')),
  current_version_number INTEGER     NOT NULL DEFAULT 1,
  versions               JSONB       NOT NULL DEFAULT '[]',
  uploaded_by            TEXT        NOT NULL DEFAULT 'system',
  uploaded_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version                INTEGER     NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_tenant_id ON documents (tenant_id);

-- ─── Outbox ───────────────────────────────────────────────────────────────
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

-- ─── Row-Level Security ───────────────────────────────────────────────────
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_documents ON documents
  USING (tenant_id = current_tenant_id());