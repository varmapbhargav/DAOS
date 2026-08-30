-- ============================================================
-- Pricing & Valuation (SP9) - baseline schema (V1)
-- Schema: pricing_valuation
-- ============================================================

SET search_path TO pricing_valuation;
SELECT set_config('search_path', 'pricing_valuation,pg_catalog', false);

-- Latest prices ----------------------------------------------
CREATE TABLE IF NOT EXISTS prices (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID        NOT NULL,
  isin                TEXT        NOT NULL,
  price               JSONB       NOT NULL,
  source              TEXT        NOT NULL,
  fair_value_hierarchy TEXT       NOT NULL,
  last_updated_at     TEXT        NOT NULL,
  is_stale            BOOLEAN     NOT NULL DEFAULT false,
  version             INTEGER     NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prices_tenant_id ON prices (tenant_id);
CREATE INDEX idx_prices_isin      ON prices (isin);

-- TimescaleDB-style price history (hypertable candidate) ------
CREATE TABLE IF NOT EXISTS price_history (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID        NOT NULL,
  instrument_id UUID        NOT NULL,
  isin          TEXT        NOT NULL,
  currency      TEXT        NOT NULL,
  price         TEXT        NOT NULL DEFAULT '0',
  as_of         TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_history_tenant_id      ON price_history (tenant_id);
CREATE INDEX idx_price_history_instrument_id  ON price_history (instrument_id);
CREATE INDEX idx_price_history_isin           ON price_history (isin);

-- NOTE: In production, alter this table into a hypertable:
--   SELECT create_hypertable('pricing_valuation.price_history', 'created_at');
-- (requires the timescaledb extension; not enabled in the dev container.)

-- Valuation models -------------------------------------------
CREATE TABLE IF NOT EXISTS valuation_models (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id            UUID        NOT NULL,
  asset_id             TEXT        NOT NULL,
  methodology          TEXT        NOT NULL,
  status               TEXT        NOT NULL,
  value                JSONB,
  report_id            TEXT,
  rejection_reason     TEXT,
  discrepancy_detected BOOLEAN     NOT NULL DEFAULT false,
  version              INTEGER     NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_valuation_models_tenant_id ON valuation_models (tenant_id);
CREATE INDEX idx_valuation_models_asset_id  ON valuation_models (asset_id);
CREATE INDEX idx_valuation_models_status    ON valuation_models (status);

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
ALTER TABLE prices           ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history    ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuation_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_prices ON prices
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_price_history ON price_history
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_valuation_models ON valuation_models
  USING (tenant_id = current_tenant_id());
