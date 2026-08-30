-- ============================================================
-- Marketplace & Trading (SP8) - baseline schema (V1)
-- Schema: marketplace
-- ============================================================

SET search_path TO marketplace;
SELECT set_config('search_path', 'marketplace,pg_catalog', false);

-- Listings ----------------------------------------------------
CREATE TABLE IF NOT EXISTS listings (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID        NOT NULL,
  product_id      TEXT        NOT NULL,
  issue_id        TEXT,
  listing_type    TEXT        NOT NULL,
  mechanism       TEXT        NOT NULL,
  currency        TEXT        NOT NULL,
  status          TEXT        NOT NULL,
  total_quantity  TEXT        NOT NULL,
  minimum_quantity TEXT       NOT NULL,
  reference_price JSONB,
  session         JSONB,
  version         INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listings_tenant_id  ON listings (tenant_id);
CREATE INDEX idx_listings_product_id ON listings (product_id);
CREATE INDEX idx_listings_status     ON listings (status);

-- Orders ------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID        NOT NULL,
  listing_id     TEXT        NOT NULL,
  investor_id    TEXT        NOT NULL,
  side           TEXT        NOT NULL,
  order_type     TEXT        NOT NULL,
  status         TEXT        NOT NULL,
  quantity       TEXT        NOT NULL,
  filled_quantity TEXT       NOT NULL,
  limit_price    JSONB,
  placed_at      TIMESTAMPTZ NOT NULL,
  version        INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_tenant_id   ON orders (tenant_id);
CREATE INDEX idx_orders_listing_id  ON orders (listing_id);
CREATE INDEX idx_orders_investor_id ON orders (investor_id);
CREATE INDEX idx_orders_status      ON orders (status);

-- Trades ------------------------------------------------------
CREATE TABLE IF NOT EXISTS trades (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID        NOT NULL,
  listing_id   TEXT        NOT NULL,
  buy_order_id TEXT        NOT NULL,
  sell_order_id TEXT       NOT NULL,
  quantity     TEXT        NOT NULL,
  price        JSONB       NOT NULL,
  status       TEXT        NOT NULL,
  executed_at  TIMESTAMPTZ NOT NULL,
  version      INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trades_tenant_id  ON trades (tenant_id);
CREATE INDEX idx_trades_listing_id ON trades (listing_id);

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
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades    ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_listings ON listings
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_orders ON orders
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_trades ON trades
  USING (tenant_id = current_tenant_id());
