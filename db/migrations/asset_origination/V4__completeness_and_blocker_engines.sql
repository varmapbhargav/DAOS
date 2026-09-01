-- ============================================================
-- Asset Origination — V4: completeness & blocker engines
-- Schema: asset_origination
-- ============================================================

SET search_path TO asset_origination;
SELECT set_config('search_path', 'asset_origination,pg_catalog', false);

-- ─── Completeness Results ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS completeness_results (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID        NOT NULL,
  case_id        UUID        NOT NULL,
  breakdown      JSONB       NOT NULL DEFAULT '{}',
  calculated_by  UUID        NOT NULL,
  calculated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_completeness_results_tenant_id ON completeness_results (tenant_id);
CREATE INDEX idx_completeness_results_case_id   ON completeness_results (case_id);

-- ─── Blockers ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blockers (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id            UUID        NOT NULL,
  case_id              UUID        NOT NULL,
  severity             TEXT        NOT NULL
                           CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  category             TEXT        NOT NULL,
  description          TEXT        NOT NULL,
  owner                UUID,
  due_date             TIMESTAMPTZ,
  resolution_action    TEXT,
  evidence_references  JSONB       NOT NULL DEFAULT '[]',
  resolution_status    TEXT        NOT NULL DEFAULT 'OPEN'
                           CHECK (resolution_status IN ('OPEN','RESOLVED','WAIVED')),
  resolved_by          UUID,
  resolved_at          TIMESTAMPTZ,
  resolved_reason      TEXT,
  raised_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blockers_tenant_id ON blockers (tenant_id);
CREATE INDEX idx_blockers_case_id   ON blockers (case_id);
CREATE INDEX idx_blockers_resolution_status ON blockers (resolution_status);

-- ─── Row-Level Security ─────────────────────────────────────────────────
ALTER TABLE completeness_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockers            ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_completeness_results ON completeness_results
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_blockers ON blockers
  USING (tenant_id = current_tenant_id());