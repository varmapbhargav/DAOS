-- ============================================================
-- Cap Table — baseline schema (V1)
-- Schema: cap_table
-- ============================================================

SET search_path TO cap_table;
SELECT set_config('search_path', 'cap_table,pg_catalog', false);

-- ─── Cap tables ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cap_tables (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id          UUID        NOT NULL,
  issuance_id        UUID,
  share_class_id     TEXT        NOT NULL DEFAULT 'common',
  shareholders       JSONB       NOT NULL DEFAULT '[]',
  transfer_log       JSONB       NOT NULL DEFAULT '[]',
  total_issued_units TEXT        NOT NULL DEFAULT '0',
  synced_at          TIMESTAMPTZ,
  version            INTEGER     NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cap_tables_tenant_id   ON cap_tables (tenant_id);
CREATE INDEX idx_cap_tables_issuance_id ON cap_tables (issuance_id);

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
ALTER TABLE cap_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_cap_tables ON cap_tables
  USING (tenant_id = current_tenant_id());