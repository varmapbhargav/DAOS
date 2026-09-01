-- ============================================================
-- Asset Origination — V5: due diligence & asset risk engines
-- Schema: asset_origination
-- ============================================================

SET search_path TO asset_origination;
SELECT set_config('search_path', 'asset_origination,pg_catalog', false);

-- ─── Due Diligence Cases ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dd_cases (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID        NOT NULL,
  case_id      UUID        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'IN_PROGRESS'
                     CHECK (status IN ('IN_PROGRESS','COMPLETED')),
  checklist    JSONB       NOT NULL DEFAULT '[]',
  reviewers    JSONB       NOT NULL DEFAULT '[]',
  due_date     TIMESTAMPTZ,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  summary      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_dd_cases_case UNIQUE (tenant_id, case_id)
);

CREATE INDEX idx_dd_cases_tenant_id ON dd_cases (tenant_id);
CREATE INDEX idx_dd_cases_case_id   ON dd_cases (case_id);

-- ─── DD Findings ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dd_findings (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID        NOT NULL,
  dd_case_id     UUID        NOT NULL REFERENCES dd_cases (id),
  case_id        UUID        NOT NULL,
  category       TEXT        NOT NULL
                     CHECK (category IN (
                       'LEGAL','FINANCIAL','TAX','COMMERCIAL','REGULATORY','OPERATIONAL','TECHNICAL',
                       'ESG','INSURANCE','CYBER','DIGITAL_ASSET','CUSTODY','SMART_CONTRACT')),
  severity       TEXT        NOT NULL
                     CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW','INFORMATIONAL')),
  description    TEXT        NOT NULL,
  evidence       JSONB       NOT NULL DEFAULT '[]',
  impact         TEXT,
  recommendation TEXT,
  remediation    TEXT,
  owner          UUID,
  due_date       TIMESTAMPTZ,
  status         TEXT        NOT NULL DEFAULT 'OPEN'
                     CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED','WAIVED')),
  reviewer       UUID,
  created_at     TIMESTAMPTZ NOT NULL,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dd_findings_tenant_id   ON dd_findings (tenant_id);
CREATE INDEX idx_dd_findings_dd_case_id  ON dd_findings (dd_case_id);
CREATE INDEX idx_dd_findings_case_id     ON dd_findings (case_id);
CREATE INDEX idx_dd_findings_status      ON dd_findings (status);

-- ─── Asset Risk Assessments ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_assessments (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID        NOT NULL,
  case_id       UUID        NOT NULL,
  overall_score INTEGER     NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  risk_level    TEXT        NOT NULL
                    CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  assessed_by   UUID        NOT NULL,
  assessed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  summary       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_risk_assessments_case UNIQUE (tenant_id, case_id)
);

CREATE INDEX idx_risk_assessments_tenant_id ON risk_assessments (tenant_id);
CREATE INDEX idx_risk_assessments_case_id   ON risk_assessments (case_id);

-- ─── Risk Items ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_items (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID        NOT NULL,
  assessment_id UUID        NOT NULL REFERENCES risk_assessments (id),
  case_id       UUID        NOT NULL,
  category      TEXT        NOT NULL
                    CHECK (category IN (
                      'OWNERSHIP','LEGAL','DOCUMENTATION','COUNTERPARTY','JURISDICTION','REGULATORY_ELIGIBILITY',
                      'VALUATION_CONFIDENCE','DATA_QUALITY','OPERATIONAL','MARKET','TECHNOLOGY','SMART_CONTRACT',
                      'CUSTODY','CONCENTRATION','FRAUD_PROVENANCE')),
  description   TEXT        NOT NULL,
  probability   TEXT        NOT NULL CHECK (probability IN ('LOW','MEDIUM','HIGH')),
  impact        TEXT        NOT NULL CHECK (impact IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  score         INTEGER     NOT NULL CHECK (score BETWEEN 0 AND 100),
  mitigation    TEXT,
  owner         UUID,
  due_date      TIMESTAMPTZ,
  evidence      JSONB       NOT NULL DEFAULT '[]',
  status        TEXT        NOT NULL DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN','MITIGATED','ACCEPTED')),
  created_at    TIMESTAMPTZ NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_items_tenant_id     ON risk_items (tenant_id);
CREATE INDEX idx_risk_items_assessment_id ON risk_items (assessment_id);
CREATE INDEX idx_risk_items_case_id       ON risk_items (case_id);
CREATE INDEX idx_risk_items_status        ON risk_items (status);

-- ─── Row-Level Security ─────────────────────────────────────────────────
ALTER TABLE dd_cases          ENABLE ROW LEVEL SECURITY;
ALTER TABLE dd_findings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_items        ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_dd_cases ON dd_cases
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_dd_findings ON dd_findings
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_risk_assessments ON risk_assessments
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_risk_items ON risk_items
  USING (tenant_id = current_tenant_id());