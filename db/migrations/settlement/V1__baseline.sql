-- ============================================================
-- Settlement & Clearing (SP8) - baseline schema (V1)
-- Schema: settlement
-- ============================================================

SET search_path TO settlement;
SELECT set_config('search_path', 'settlement,pg_catalog', false);

-- Settlement instructions -------------------------------------
CREATE TABLE IF NOT EXISTS settlement_instructions (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID        NOT NULL,
  trade_reference TEXT       NOT NULL,
  status         TEXT        NOT NULL,
  settlement_type TEXT       NOT NULL,
  cycle          TEXT        NOT NULL,
  settlement_date TEXT       NOT NULL,
  security_id    TEXT        NOT NULL,
  quantity       TEXT        NOT NULL,
  amount         JSONB       NOT NULL,
  legs           JSONB       NOT NULL DEFAULT '[]',
  failure_reason TEXT,
  version        INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_settlement_instructions_tenant_id ON settlement_instructions (tenant_id);
CREATE INDEX idx_settlement_instructions_trade_ref ON settlement_instructions (trade_reference);
CREATE INDEX idx_settlement_instructions_status    ON settlement_instructions (status);

-- Custody accounts --------------------------------------------
CREATE TABLE IF NOT EXISTS custody_accounts (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID        NOT NULL,
  investor_id  TEXT        NOT NULL,
  custody_type TEXT        NOT NULL,
  custodian_ref TEXT       NOT NULL,
  holdings     JSONB       NOT NULL DEFAULT '[]',
  version      INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_custody_accounts_tenant_id   ON custody_accounts (tenant_id);
CREATE INDEX idx_custody_accounts_investor_id ON custody_accounts (investor_id);

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
ALTER TABLE settlement_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custody_accounts        ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_settlement_instructions ON settlement_instructions
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_custody_accounts ON custody_accounts
  USING (tenant_id = current_tenant_id());
