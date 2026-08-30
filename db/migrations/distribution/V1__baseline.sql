-- ============================================================
-- Distribution & Capital Raising (SP7) - baseline schema (V1)
-- Schema: distribution
-- ============================================================

SET search_path TO distribution;
SELECT set_config('search_path', 'distribution,pg_catalog', false);

-- Subscriptions -------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id        UUID        NOT NULL,
  product_id       TEXT        NOT NULL,
  investor_id      TEXT        NOT NULL,
  status           TEXT        NOT NULL,
  requested_amount JSONB       NOT NULL,
  allocated_amount JSONB,
  allocation_pct   NUMERIC,
  payment_ref      TEXT,
  reject_reason    TEXT,
  funded_at        TIMESTAMPTZ,
  received_at      TIMESTAMPTZ NOT NULL,
  version          INTEGER     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_tenant_id   ON subscriptions (tenant_id);
CREATE INDEX idx_subscriptions_product_id  ON subscriptions (product_id);
CREATE INDEX idx_subscriptions_investor_id ON subscriptions (investor_id);

-- Allocations ---------------------------------------------------
CREATE TABLE IF NOT EXISTS allocations (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID        NOT NULL,
  closing_id   TEXT        NOT NULL,
  product_id   TEXT        NOT NULL,
  method       TEXT        NOT NULL,
  status       TEXT        NOT NULL,
  total_amount JSONB       NOT NULL,
  entries      JSONB       NOT NULL DEFAULT '[]',
  version      INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_allocations_tenant_id  ON allocations (tenant_id);
CREATE INDEX idx_allocations_closing_id ON allocations (closing_id);
CREATE INDEX idx_allocations_product_id ON allocations (product_id);

-- Capital calls ------------------------------------------------
CREATE TABLE IF NOT EXISTS capital_calls (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID        NOT NULL,
  closing_id   TEXT        NOT NULL,
  investor_id  TEXT        NOT NULL,
  amount       JSONB       NOT NULL,
  amount_funded JSONB      NOT NULL,
  status       TEXT        NOT NULL,
  due_date     TEXT        NOT NULL,
  funded_at    TIMESTAMPTZ,
  version      INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_capital_calls_tenant_id  ON capital_calls (tenant_id);
CREATE INDEX idx_capital_calls_closing_id ON capital_calls (closing_id);
CREATE INDEX idx_capital_calls_investor_id ON capital_calls (investor_id);

-- Closings ------------------------------------------------------
CREATE TABLE IF NOT EXISTS closings (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID        NOT NULL,
  product_id   TEXT        NOT NULL,
  status       TEXT        NOT NULL,
  closes_at    TEXT        NOT NULL,
  completed_at TIMESTAMPTZ,
  version      INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_closings_tenant_id  ON closings (tenant_id);
CREATE INDEX idx_closings_product_id ON closings (product_id);

-- Outbox --------------------------------------------------------
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
ALTER TABLE subscriptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_calls  ENABLE ROW LEVEL SECURITY;
ALTER TABLE closings       ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_subscriptions ON subscriptions
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_allocations ON allocations
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_capital_calls ON capital_calls
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_closings ON closings
  USING (tenant_id = current_tenant_id());
