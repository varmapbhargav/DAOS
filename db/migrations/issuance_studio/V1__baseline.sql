-- ============================================================
-- Issuance Studio — baseline schema (V1)
-- Schema: issuance_studio
-- ============================================================

SET search_path TO issuance_studio;
SELECT set_config('search_path', 'issuance_studio,pg_catalog', false);

-- ─── Issuances ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS issuances (
  id                     UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id              UUID        NOT NULL,
  name                   TEXT        NOT NULL,
  instrument_type        TEXT        NOT NULL,
  network                TEXT        NOT NULL,
  status                 TEXT        NOT NULL DEFAULT 'draft'
                                    CHECK (status IN ('draft','legalDocsSigned','entityFormed','minted','whitelistOpen','complete')),
  cap_table_id           UUID,
  whitelist              JSONB       NOT NULL DEFAULT '[]',
  transfer_restrictions  JSONB       NOT NULL DEFAULT '[]',
  token_standard         TEXT        NOT NULL DEFAULT 'nativeChain',
  total_supply_minor_units TEXT      NOT NULL DEFAULT '0',
  version                INTEGER     NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_issuances_tenant_id  ON issuances (tenant_id);
CREATE INDEX idx_issuances_cap_table  ON issuances (cap_table_id);

-- ─── Mint requests ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mint_requests (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID        NOT NULL,
  issuance_id       UUID        NOT NULL,
  amount_minor_units TEXT       NOT NULL,
  to_address        TEXT        NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending','confirmed','failed')),
  tx_hash           TEXT,
  requested_by      UUID,
  requested_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at      TIMESTAMPTZ,
  version           INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mint_requests_tenant_id ON mint_requests (tenant_id);
CREATE INDEX idx_mint_requests_issuance  ON mint_requests (issuance_id);

-- ─── Outbox ───────────────────────────────────────────────────────────────
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

-- ─── Row-Level Security ───────────────────────────────────────────────────
ALTER TABLE issuances      ENABLE ROW LEVEL SECURITY;
ALTER TABLE mint_requests  ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_issuances ON issuances
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_mint_requests ON mint_requests
  USING (tenant_id = current_tenant_id());