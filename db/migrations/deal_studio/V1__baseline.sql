-- ============================================================
-- Deal Structuring — baseline schema (V1)
-- Schema: deal_studio
-- ============================================================

SET search_path TO deal_studio;
SELECT set_config('search_path', 'deal_studio,pg_catalog', false);

-- ─── Deals ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID        NOT NULL,
  name              TEXT        NOT NULL,
  asset_id          UUID        NOT NULL,
  sponsor_id        UUID        NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'draft'
                                    CHECK (status IN ('draft','structuring','legalReview','approved','closed','cancelled')),
  capital_stack     JSONB,
  economic_rights   JSONB,
  governance_terms  JSONB,
  closing_conditions JSONB      NOT NULL DEFAULT '[]',
  approved_by       UUID,
  closed_at         TIMESTAMPTZ,
  version           INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  created_by        UUID,
  updated_by        UUID
);

CREATE INDEX idx_deals_tenant_id       ON deals (tenant_id);
CREATE INDEX idx_deals_asset_id        ON deals (asset_id);
CREATE INDEX idx_deals_deleted_at      ON deals (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_status          ON deals (status);
CREATE UNIQUE INDEX idx_deals_reference_number ON deals (tenant_id, reference_number);
-- Foreign key references (assuming assets and investors tables exist in their respective schemas)
-- ALTER TABLE deals ADD CONSTRAINT fk_deals_asset FOREIGN KEY (asset_id) REFERENCES assets(id);
-- ALTER TABLE deals ADD CONSTRAINT fk_deals_sponsor FOREIGN KEY (sponsor_id) REFERENCES investors(id);

-- ─── Term Sheets ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS term_sheets (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id          UUID        NOT NULL,
  deal_id            UUID        NOT NULL,
  governance_terms   JSONB,
  economic_rights    JSONB,
  vesting_schedule   JSONB,
  transfer_restrictions JSONB    NOT NULL DEFAULT '[]',
  closing_conditions JSONB       NOT NULL DEFAULT '[]',
  status             TEXT        NOT NULL DEFAULT 'draft'
                                  CHECK (status IN ('draft','finalized')),
  finalized_at       TIMESTAMPTZ,
  finalized_by       UUID,
  version            INTEGER     NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at         TIMESTAMPTZ,
  created_by         UUID,
  updated_by         UUID
);

CREATE INDEX idx_term_sheets_tenant_id   ON term_sheets (tenant_id);
CREATE INDEX idx_term_sheets_deal_id     ON term_sheets (deal_id);
CREATE INDEX idx_term_sheets_deleted_at  ON term_sheets (deleted_at) WHERE deleted_at IS NULL;

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
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ,
  created_by     UUID
);

CREATE INDEX idx_outbox_undispatched ON outbox_events (created_at)
  WHERE dispatched_at IS NULL;

-- ─── Idempotency keys ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key         TEXT        PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Row-Level Security ──────────────────────────────────────────────────
ALTER TABLE deals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_sheets  ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_deals ON deals
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_term_sheets ON term_sheets
  USING (tenant_id = current_tenant_id());

-- ─── Term Sheets ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS term_sheets (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id          UUID        NOT NULL,
  deal_id            UUID        NOT NULL,
  governance_terms   JSONB,
  economic_rights    JSONB,
  vesting_schedule   JSONB,
  transfer_restrictions JSONB    NOT NULL DEFAULT '[]',
  closing_conditions JSONB       NOT NULL DEFAULT '[]',
  status             TEXT        NOT NULL DEFAULT 'draft'
                                 CHECK (status IN ('draft','finalized')),
  finalized_at       TIMESTAMPTZ,
  finalized_by       UUID,
  version            INTEGER     NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_term_sheets_tenant_id ON term_sheets (tenant_id);
CREATE INDEX idx_term_sheets_deal_id   ON term_sheets (deal_id);

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
ALTER TABLE deals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_sheets  ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_deals ON deals
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_term_sheets ON term_sheets
  USING (tenant_id = current_tenant_id());
