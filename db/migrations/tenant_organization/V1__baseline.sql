-- ============================================================
-- Tenant Organization — baseline schema (V1)
-- Schema: tenant_organization
-- ============================================================

SET search_path TO tenant_organization;
SELECT set_config('search_path', 'tenant_organization,pg_catalog', false);

-- ─── Tenant Profiles ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenant_profiles (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID        NOT NULL,
  org_name          TEXT        NOT NULL,
  legal_name        TEXT        NOT NULL DEFAULT '',
  tax_id            TEXT        NOT NULL DEFAULT '',
  website           TEXT        NOT NULL DEFAULT '',
  contact_email     TEXT        NOT NULL DEFAULT '',
  contact_phone     TEXT        NOT NULL DEFAULT '',
  country           TEXT        NOT NULL DEFAULT '',
  addresses         JSONB       NOT NULL DEFAULT '[]',
  brand_color       TEXT        NOT NULL DEFAULT '#000000',
  logo_url          TEXT,
  custom_domain     TEXT,
  feature_flags     JSONB       NOT NULL DEFAULT '{}',
  status            TEXT        NOT NULL DEFAULT 'active',
  version           INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenant_profiles_tenant_id ON tenant_profiles (tenant_id);
CREATE INDEX idx_tenant_profiles_status    ON tenant_profiles (status);

-- ─── Service Entitlements ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_entitlements (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID        NOT NULL,
  plan_type         TEXT        NOT NULL,
  billing_cycle     TEXT        NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'active',
  price_per_seat    TEXT        NOT NULL DEFAULT '0',
  payment_method    JSONB,
  usage_limits      JSONB       NOT NULL,
  current_usage     JSONB       NOT NULL,
  next_invoice_date TEXT,
  version           INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_entitlements_tenant_id ON service_entitlements (tenant_id);
CREATE INDEX idx_service_entitlements_status    ON service_entitlements (status);

-- ─── API Keys ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID        NOT NULL,
  label             TEXT        NOT NULL,
  key_hash          TEXT        NOT NULL,
  scope             TEXT        NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'active',
  prefix            TEXT        NOT NULL,
  created_at        TEXT        NOT NULL,
  expires_at        TEXT,
  last_used_at      TEXT,
  version           INTEGER     NOT NULL DEFAULT 0,
  db_created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_tenant_id ON api_keys (tenant_id);
CREATE INDEX idx_api_keys_status    ON api_keys (status);

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
ALTER TABLE tenant_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys             ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_tenant_profiles ON tenant_profiles
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_service_entitlements ON service_entitlements
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_api_keys ON api_keys
  USING (tenant_id = current_tenant_id());
