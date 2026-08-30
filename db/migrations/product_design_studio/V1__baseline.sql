-- ============================================================
-- Product Design Studio — baseline schema (V1)
-- Schema: product_design_studio
-- ============================================================

SET search_path TO product_design_studio;
SELECT set_config('search_path', 'product_design_studio,pg_catalog', false);

-- ─── Investment Products ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investment_products (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID        NOT NULL,
  name              TEXT        NOT NULL,
  product_type      TEXT        NOT NULL,
  strategy          JSONB       NOT NULL,
  benchmark         JSONB,
  liquidity_terms   JSONB       NOT NULL,
  fee_structure     JSONB       NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'design'
                                  CHECK (status IN ('design','feeApproval','approved','closed')),
  share_class_ids   JSONB       NOT NULL DEFAULT '[]',
  approved_by       UUID,
  rejection_reason  TEXT,
  version           INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_investment_products_tenant_id ON investment_products (tenant_id);

-- ─── Share Classes ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS share_classes (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id            UUID        NOT NULL,
  product_id           UUID        NOT NULL,
  name                 TEXT        NOT NULL,
  currency             TEXT        NOT NULL,
  target_size_amount   BIGINT      NOT NULL,
  target_size_currency TEXT        NOT NULL,
  min_investment_amount BIGINT     NOT NULL,
  min_investment_currency TEXT    NOT NULL,
  max_investors        INTEGER     NOT NULL,
  price_per_share_amount BIGINT,
  price_per_share_currency TEXT,
  status               TEXT        NOT NULL DEFAULT 'draft'
                                   CHECK (status IN ('draft','approved','closed')),
  version              INTEGER     NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_share_classes_tenant_id  ON share_classes (tenant_id);
CREATE INDEX idx_share_classes_product_id ON share_classes (product_id);

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
ALTER TABLE investment_products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_classes        ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_investment_products ON investment_products
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_share_classes ON share_classes
  USING (tenant_id = current_tenant_id());
