-- ============================================================
-- Waterfall Engine & Corporate Actions (SP9) - baseline schema (V1)
-- Schema: waterfall_engine
-- ============================================================

SET search_path TO waterfall_engine;
SELECT set_config('search_path', 'waterfall_engine,pg_catalog', false);

-- Waterfall models ------------------------------------------
CREATE TABLE IF NOT EXISTS waterfall_models (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID        NOT NULL,
  name           TEXT        NOT NULL,
  waterfall_type TEXT        NOT NULL,
  product_id     TEXT        NOT NULL,
  status         TEXT        NOT NULL,
  tiers          JSONB       NOT NULL,
  version        INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_waterfall_models_tenant_id   ON waterfall_models (tenant_id);
CREATE INDEX idx_waterfall_models_product_id  ON waterfall_models (product_id);
CREATE INDEX idx_waterfall_models_status      ON waterfall_models (status);

-- Distributions ---------------------------------------------
CREATE TABLE IF NOT EXISTS distributions (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             UUID        NOT NULL,
  product_id            TEXT        NOT NULL,
  distribution_type     TEXT        NOT NULL,
  currency              TEXT        NOT NULL,
  total_amount          TEXT        NOT NULL DEFAULT '0',
  record_date           TEXT        NOT NULL,
  payment_date          TEXT        NOT NULL,
  status                TEXT        NOT NULL,
  investor_distributions JSONB      NOT NULL DEFAULT '[]',
  promote               TEXT        NOT NULL DEFAULT '0',
  carried_interest      TEXT        NOT NULL DEFAULT '0',
  version               INTEGER     NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_distributions_tenant_id   ON distributions (tenant_id);
CREATE INDEX idx_distributions_product_id  ON distributions (product_id);
CREATE INDEX idx_distributions_status      ON distributions (status);

-- Corporate actions -----------------------------------------
CREATE TABLE IF NOT EXISTS corporate_actions (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID        NOT NULL,
  issuance_id  TEXT        NOT NULL,
  type         TEXT        NOT NULL,
  ex_date      TEXT        NOT NULL,
  record_date  TEXT        NOT NULL,
  payment_date TEXT        NOT NULL,
  status       TEXT        NOT NULL,
  options      JSONB       NOT NULL DEFAULT '[]',
  elections    JSONB       NOT NULL DEFAULT '[]',
  version      INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_corporate_actions_tenant_id    ON corporate_actions (tenant_id);
CREATE INDEX idx_corporate_actions_issuance_id  ON corporate_actions (issuance_id);
CREATE INDEX idx_corporate_actions_status       ON corporate_actions (status);

-- Outbox ------------------------------------------------------
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

-- Idempotency keys ---------------------------------------------
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key         TEXT        PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-Level Security -------------------------------------------
ALTER TABLE waterfall_models   ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_actions  ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_waterfall_models ON waterfall_models
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_distributions ON distributions
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_corporate_actions ON corporate_actions
  USING (tenant_id = current_tenant_id());
