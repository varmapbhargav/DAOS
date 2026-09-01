-- ============================================================
-- Asset Origination — V8: asset pooling
-- Schema: asset_origination
-- ============================================================

SET search_path TO asset_origination;
SELECT set_config('search_path', 'asset_origination,pg_catalog', false);

-- ─── Asset Pools ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_pools (
  id                       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id                UUID        NOT NULL,
  name                     TEXT        NOT NULL UNIQUE,
  description              TEXT,
  pool_type                TEXT        NOT NULL
                               CHECK (pool_type IN ('REVOLVING','STATIC','DYNAMIC','WAREHOUSE','SECURITIZATION','FUND')),
  strategy                 TEXT        NOT NULL
                               CHECK (strategy IN ('DIVERSIFIED','SECTOR_FOCUSED','GEOGRAPHIC_FOCUSED','ASSET_CLASS_FOCUSED','YIELD_OPTIMIZED','RISK_BALANCED')),
  currency                 CHAR(3)     NOT NULL DEFAULT 'USD'
                               CHECK (currency IN ('USD','EUR','GBP','CHF','JPY','CAD','AUD','SGD','HKD')),
  status                   TEXT        NOT NULL DEFAULT 'DRAFT'
                               CHECK (status IN ('DRAFT','ACTIVE','CLOSED','LIQUIDATING','LIQUIDATED','SUSPENDED')),
  concentration_rules      JSONB       NOT NULL DEFAULT '[]',
  eligibility_policy       JSONB       NOT NULL DEFAULT '{}',
  gross_value              NUMERIC     NOT NULL DEFAULT 0,
  net_value                NUMERIC     NOT NULL DEFAULT 0,
  outstanding_value        NUMERIC     NOT NULL DEFAULT 0,
  jurisdictions            JSONB       NOT NULL DEFAULT '[]',
  weighted_avg_maturity    NUMERIC,
  weighted_avg_ltv         NUMERIC,
  concentration            NUMERIC     NOT NULL DEFAULT 0,
  version                  INTEGER     NOT NULL DEFAULT 1,
  created_by               UUID        NOT NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at                TIMESTAMPTZ,
  parent_pool_id           UUID REFERENCES asset_pools (id),
  child_pool_ids           JSONB       NOT NULL DEFAULT '[]'
);

CREATE INDEX idx_asset_pools_tenant_id ON asset_pools (tenant_id);
CREATE INDEX idx_asset_pools_status    ON asset_pools (status);
CREATE INDEX idx_asset_pools_parent    ON asset_pools (parent_pool_id);

-- ─── Pool Assets ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pool_assets (
  id                       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id                UUID        NOT NULL,
  pool_id                  UUID        NOT NULL REFERENCES asset_pools (id),
  asset_id                 UUID        NOT NULL,
  allocation_percentage    NUMERIC     NOT NULL CHECK (allocation_percentage BETWEEN 0 AND 100),
  added_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at               TIMESTAMPTZ,
  removal_reason           TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pool_assets_tenant_id ON pool_assets (tenant_id);
CREATE INDEX idx_pool_assets_pool_id   ON pool_assets (pool_id);
CREATE INDEX idx_pool_assets_asset_id  ON pool_assets (asset_id);
CREATE INDEX idx_pool_assets_active    ON pool_assets (pool_id, removed_at) WHERE removed_at IS NULL;

-- ─── Row-Level Security ─────────────────────────────────────────────────
ALTER TABLE asset_pools  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_assets  ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_asset_pools ON asset_pools
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_pool_assets ON pool_assets
  USING (tenant_id = current_tenant_id());