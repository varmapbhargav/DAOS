-- ============================================================
-- Asset Origination — V9: interactions & task management
-- Schema: asset_origination
-- ============================================================

SET search_path TO asset_origination;
SELECT set_config('search_path', 'asset_origination,pg_catalog', false);

-- ─── Interactions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interactions (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id          UUID        NOT NULL,
  case_id            UUID,
  asset_id           UUID,
  counterparty_id    UUID,
  type               TEXT        NOT NULL
                           CHECK (type IN ('EMAIL','MEETING','CALL','MESSAGE','DATA_REQUEST','DOCUMENT_REQUEST','SITE_VISIT','NEGOTIATION','REVIEW')),
  direction          TEXT        NOT NULL CHECK (direction IN ('INBOUND','OUTBOUND')),
  subject            TEXT        NOT NULL,
  body               TEXT,
  participants       JSONB       NOT NULL DEFAULT '[]',
  occurred_at        TIMESTAMPTZ NOT NULL,
  recorded_by        UUID        NOT NULL,
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata           JSONB       NOT NULL DEFAULT '{}',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interactions_tenant_id      ON interactions (tenant_id);
CREATE INDEX idx_interactions_case_id        ON interactions (case_id);
CREATE INDEX idx_interactions_asset_id       ON interactions (asset_id);
CREATE INDEX idx_interactions_counterparty   ON interactions (counterparty_id);
CREATE INDEX idx_interactions_occurred_at    ON interactions (occurred_at);

-- ─── Tasks ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id          UUID        NOT NULL,
  case_id            UUID,
  asset_id           UUID,
  type               TEXT        NOT NULL
                           CHECK (type IN ('REQUEST_DOCUMENT','VERIFY_OWNERSHIP','LEGAL_REVIEW','COMPLIANCE_REVIEW','DUE_DILIGENCE','VALUATION','RISK_REVIEW','APPROVAL','RESOLVE_BLOCKER')),
  title              TEXT        NOT NULL,
  description        TEXT,
  priority           TEXT        NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  status             TEXT        NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ASSIGNED','IN_PROGRESS','BLOCKED','COMPLETED','CANCELLED','OVERDUE')),
  owner              UUID,
  assignee           UUID,
  due_date           TIMESTAMPTZ,
  sla_hours          INTEGER,
  dependencies       JSONB       NOT NULL DEFAULT '[]',
  evidence           JSONB       NOT NULL DEFAULT '[]',
  started_at         TIMESTAMPTZ,
  completed_at       TIMESTAMPTZ,
  escalated          BOOLEAN     NOT NULL DEFAULT FALSE,
  escalated_to       UUID,
  escalated_at       TIMESTAMPTZ,
  escalation_reason  TEXT,
  created_by         UUID        NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_tenant_id   ON tasks (tenant_id);
CREATE INDEX idx_tasks_case_id     ON tasks (case_id);
CREATE INDEX idx_tasks_asset_id    ON tasks (asset_id);
CREATE INDEX idx_tasks_assignee    ON tasks (assignee);
CREATE INDEX idx_tasks_status      ON tasks (status);
CREATE INDEX idx_tasks_due_date    ON tasks (due_date);
CREATE INDEX idx_tasks_type        ON tasks (type);

-- ─── Row-Level Security ─────────────────────────────────────────────────
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks        ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_interactions ON interactions
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_tasks ON tasks
  USING (tenant_id = current_tenant_id());