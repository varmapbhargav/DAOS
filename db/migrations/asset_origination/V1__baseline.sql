-- ============================================================
-- Asset Origination — baseline schema (V1)
-- Schema: asset_origination
-- ============================================================

SET search_path TO asset_origination;
SELECT set_config('search_path', 'asset_origination,pg_catalog', false);

-- ─── Assets ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
  id                       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id                UUID        NOT NULL,
  name                     TEXT        NOT NULL,
  asset_class              TEXT        NOT NULL,
  sponsor_id               UUID        NOT NULL,
  status                   TEXT        NOT NULL DEFAULT 'originated'
                                       CHECK (status IN ('originated','underDueDiligence','dueDiligenceCompleted','valuationUpdated','approved','rejected')),
  jurisdictions            JSONB       NOT NULL DEFAULT '[]',
  purchase_price_amount    BIGINT,
  purchase_price_currency  TEXT,
  collateral               JSONB       NOT NULL DEFAULT '[]',
  provenance               JSONB       NOT NULL DEFAULT '[]',
  valuation_fair_value     TEXT,
  valuation_currency       TEXT,
  valuation_methodology    TEXT,
  valuation_valued_at      TIMESTAMPTZ,
  approved_by              UUID,
  rejection_reason         TEXT,
  version                  INTEGER     NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_tenant_id  ON assets (tenant_id);
CREATE INDEX idx_assets_sponsor_id ON assets (sponsor_id);

-- ─── Due Diligence Reports ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS due_diligence_reports (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID        NOT NULL,
  asset_id     UUID        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft','inProgress','completed')),
  rating       TEXT,
  findings     JSONB       NOT NULL DEFAULT '[]',
  completed_by UUID,
  completed_at TIMESTAMPTZ,
  summary      TEXT,
  version      INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_due_diligence_reports_tenant_id ON due_diligence_reports (tenant_id);
CREATE INDEX idx_due_diligence_reports_asset_id ON due_diligence_reports (asset_id);

-- ─── Cash Flow Models ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cash_flow_models (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID        NOT NULL,
  asset_id        UUID        NOT NULL,
  name            TEXT        NOT NULL,
  assumptions     JSONB       NOT NULL DEFAULT '{}',
  net_irr_percent DOUBLE PRECISION,
  net_multiple    DOUBLE PRECISION,
  version         INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cash_flow_models_tenant_id ON cash_flow_models (tenant_id);
CREATE INDEX idx_cash_flow_models_asset_id  ON cash_flow_models (asset_id);

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
ALTER TABLE assets                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE due_diligence_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_models       ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_assets ON assets
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_due_diligence_reports ON due_diligence_reports
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_cash_flow_models ON cash_flow_models
  USING (tenant_id = current_tenant_id());
