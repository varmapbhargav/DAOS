-- ============================================================
-- Asset Origination — V3: screening & qualification engines
-- Schema: asset_origination
-- ============================================================

SET search_path TO asset_origination;
SELECT set_config('search_path', 'asset_origination,pg_catalog', false);

-- ─── Screening Results ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS screening_results (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id        UUID        NOT NULL,
  case_id          UUID        NOT NULL,
  decision         TEXT        NOT NULL
                     CHECK (decision IN ('PENDING','PASS','FAIL','CONDITIONAL','MANUAL_REVIEW')),
  score            INTEGER     NOT NULL DEFAULT 0,
  max_score        INTEGER     NOT NULL DEFAULT 0,
  criteria         JSONB       NOT NULL DEFAULT '[]',
  comments         TEXT,
  reviewer         UUID        NOT NULL,
  reviewed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  override_by      UUID,
  override_reason  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_screening_results_tenant_id ON screening_results (tenant_id);
CREATE INDEX idx_screening_results_case_id   ON screening_results (case_id);

-- ─── Qualification Results ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qualification_results (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id        UUID        NOT NULL,
  case_id          UUID        NOT NULL,
  decision         TEXT        NOT NULL
                     CHECK (decision IN ('PENDING','QUALIFIED','DISQUALIFIED','CONDITIONAL')),
  score            JSONB       NOT NULL DEFAULT '{}',
  blockers         JSONB       NOT NULL DEFAULT '[]',
  missing_evidence JSONB       NOT NULL DEFAULT '[]',
  explanation      TEXT,
  qualified_by     UUID        NOT NULL,
  qualified_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qualification_results_tenant_id ON qualification_results (tenant_id);
CREATE INDEX idx_qualification_results_case_id   ON qualification_results (case_id);

-- ─── Row-Level Security ────────────────────────────────────────────────
ALTER TABLE screening_results     ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualification_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_screening_results ON screening_results
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_qualification_results ON qualification_results
  USING (tenant_id = current_tenant_id());
