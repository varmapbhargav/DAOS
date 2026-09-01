-- ============================================================
-- Asset Origination — V7: approval engine & engineering readiness
-- Schema: asset_origination
-- ============================================================

SET search_path TO asset_origination;
SELECT set_config('search_path', 'asset_origination,pg_catalog', false);

-- ─── Approval Cases ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS approval_cases (
  id                        UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id                 UUID        NOT NULL,
  case_id                   UUID        NOT NULL,
  status                    TEXT        NOT NULL DEFAULT 'PENDING'
                                CHECK (status IN ('PENDING','IN_PROGRESS','APPROVED','REJECTED','CONDITIONALLY_APPROVED','REQUESTED_CHANGES')),
  approval_type             TEXT        NOT NULL DEFAULT 'SINGLE'
                                CHECK (approval_type IN ('SINGLE','MULTI_LEVEL_SEQUENTIAL','MULTI_LEVEL_PARALLEL','CONDITIONAL','DELEGATED')),
  levels                    JSONB       NOT NULL DEFAULT '[]',
  current_level             INTEGER     NOT NULL DEFAULT 0,
  threshold_amount          NUMERIC,
  required_approvers        JSONB       NOT NULL DEFAULT '{}',
  decisions                 JSONB       NOT NULL DEFAULT '[]',
  conditions                JSONB       NOT NULL DEFAULT '[]',
  conflict_of_interest_checked BOOLEAN  NOT NULL DEFAULT FALSE,
  started_at                TIMESTAMPTZ,
  completed_at              TIMESTAMPTZ,
  final_decided_by          UUID,
  final_reason              TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_approval_cases_case UNIQUE (tenant_id, case_id)
);

CREATE INDEX idx_approval_cases_tenant_id ON approval_cases (tenant_id);
CREATE INDEX idx_approval_cases_case_id   ON approval_cases (case_id);
CREATE INDEX idx_approval_cases_status    ON approval_cases (status);

-- ─── Approval Decisions ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS approval_decisions (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID        NOT NULL,
  case_id             UUID        NOT NULL,
  approval_case_id    UUID        NOT NULL REFERENCES approval_cases (id),
  approver            UUID        NOT NULL,
  level               TEXT        NOT NULL CHECK (level IN ('LEVEL_1','LEVEL_2','LEVEL_3','LEVEL_4','LEVEL_5')),
  decision            TEXT        NOT NULL CHECK (decision IN ('APPROVE','REJECT','REQUEST_CHANGES')),
  reason              TEXT,
  conditions          JSONB       NOT NULL DEFAULT '[]',
  decided_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_approval_decisions_tenant_id      ON approval_decisions (tenant_id);
CREATE INDEX idx_approval_decisions_case_id        ON approval_decisions (case_id);
CREATE INDEX idx_approval_decisions_approval_case  ON approval_decisions (approval_case_id);
CREATE INDEX idx_approval_decisions_approver       ON approval_decisions (approver);

-- ─── Engineering Readiness Assessments ──────────────────────────────────
CREATE TABLE IF NOT EXISTS engineering_readiness_assessments (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID        NOT NULL,
  case_id       UUID        NOT NULL,
  asset_id      UUID        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'NOT_READY'
                    CHECK (status IN ('READY','CONDITIONALLY_READY','NOT_READY')),
  checks        JSONB       NOT NULL DEFAULT '{}',
  assessed_by   UUID        NOT NULL,
  assessed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  summary       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_engineering_readiness_tenant_id ON engineering_readiness_assessments (tenant_id);
CREATE INDEX idx_engineering_readiness_case_id   ON engineering_readiness_assessments (case_id);
CREATE INDEX idx_engineering_readiness_asset_id  ON engineering_readiness_assessments (asset_id);
CREATE INDEX idx_engineering_readiness_status    ON engineering_readiness_assessments (status);

-- ─── Row-Level Security ─────────────────────────────────────────────────
ALTER TABLE approval_cases                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_decisions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_readiness_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_approval_cases ON approval_cases
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_approval_decisions ON approval_decisions
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_engineering_readiness ON engineering_readiness_assessments
  USING (tenant_id = current_tenant_id());