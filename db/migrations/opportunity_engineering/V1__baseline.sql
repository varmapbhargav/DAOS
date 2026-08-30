-- ============================================================
-- Opportunity Engineering — baseline schema (V1)
-- Schema: opportunity_engineering
-- ============================================================

SET search_path TO opportunity_engineering;
SELECT set_config('search_path', 'opportunity_engineering,pg_catalog', false);

-- ─── Opportunities ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS opportunities (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             UUID        NOT NULL,
  asset_id              UUID        NOT NULL,
  name                  TEXT        NOT NULL,
  sponsor_id            UUID        NOT NULL,
  status                TEXT        NOT NULL DEFAULT 'engineered'
                                        CHECK (status IN ('engineered','scenarioApproved','scored','approved','rejected')),
  target_return         JSONB,
  score                 JSONB,
  sensitivity_factors   JSONB       NOT NULL DEFAULT '[]',
  scenario_model_ids    JSONB       NOT NULL DEFAULT '[]',
  approved_scenario_id  UUID,
  approved_by           UUID,
  rejection_reason      TEXT,
  version               INTEGER     NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_opportunities_tenant_id  ON opportunities (tenant_id);
CREATE INDEX idx_opportunities_asset_id   ON opportunities (asset_id);
CREATE INDEX idx_opportunities_sponsor_id ON opportunities (sponsor_id);

-- ─── Scenario Models ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scenario_models (
  id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id               UUID        NOT NULL,
  opportunity_id          UUID        NOT NULL,
  name                    TEXT        NOT NULL,
  scenario_type           TEXT        NOT NULL,
  status                  TEXT        NOT NULL DEFAULT 'draft'
                                       CHECK (status IN ('draft','approved')),
  key_assumptions         JSONB       NOT NULL DEFAULT '{}',
  projected_irr_percent   DOUBLE PRECISION,
  projected_multiple      DOUBLE PRECISION,
  version                 INTEGER     NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scenario_models_tenant_id      ON scenario_models (tenant_id);
CREATE INDEX idx_scenario_models_opportunity_id ON scenario_models (opportunity_id);

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
ALTER TABLE opportunities   ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_opportunities ON opportunities
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_scenario_models ON scenario_models
  USING (tenant_id = current_tenant_id());
