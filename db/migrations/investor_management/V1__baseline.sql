-- ============================================================
-- Investor Management — baseline schema (V1)
-- Schema: investor_management
-- ============================================================

SET search_path TO investor_management;

-- ─── Investors ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investors (
  id                       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id                UUID        NOT NULL,
  user_id                  UUID,
  email                    TEXT        NOT NULL,
  status                   TEXT        NOT NULL DEFAULT 'invited'
                                       CHECK (status IN ('invited','active','disabled')),
  profile                  JSONB       NOT NULL DEFAULT '{}',
  accreditation_level      TEXT,
  accreditation_status     TEXT        NOT NULL DEFAULT 'pending'
                                       CHECK (accreditation_status IN ('pending','verified','expired','rejected')),
  accreditation_expires_at TIMESTAMPTZ,
  kyc_status               TEXT        NOT NULL DEFAULT 'notStarted'
                                       CHECK (kyc_status IN ('notStarted','submitted','underReview','approved','rejected')),
  risk_profile             JSONB,
  wallet_addresses         JSONB       NOT NULL DEFAULT '[]',
  wallet_ids               JSONB       NOT NULL DEFAULT '[]',
  version                  INTEGER     NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, email)
);

CREATE INDEX idx_investors_tenant_id ON investors (tenant_id);
CREATE INDEX idx_investors_user_id   ON investors (user_id);

-- ─── KYC Profiles ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kyc_profiles (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID        NOT NULL,
  investor_id  UUID        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'notStarted'
                           CHECK (status IN ('notStarted','submitted','underReview','approved','rejected')),
  provider_ref TEXT,
  documents    JSONB       NOT NULL DEFAULT '[]',
  submitted_at TIMESTAMPTZ,
  reviewed_at  TIMESTAMPTZ,
  report       JSONB,
  version      INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kyc_profiles_tenant_id   ON kyc_profiles (tenant_id);
CREATE INDEX idx_kyc_profiles_investor_id ON kyc_profiles (investor_id);

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
ALTER TABLE investors     ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_profiles  ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_investors ON investors
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_kyc_profiles ON kyc_profiles
  USING (tenant_id = current_tenant_id());
