-- ============================================================
-- Asset Origination — V2: origination cases & asset profile
-- Schema: asset_origination
-- ============================================================

SET search_path TO asset_origination;
SELECT set_config('search_path', 'asset_origination,pg_catalog', false);

-- ─── Origination Cases ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS origination_cases (
  id                           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id                    UUID        NOT NULL,
  case_number                  TEXT        NOT NULL,
  case_name                    TEXT        NOT NULL,
  submission_type              TEXT        NOT NULL,
  submission_channel           TEXT        NOT NULL,
  source_id                    UUID        NOT NULL,
  submitted_by                 UUID        NOT NULL,
  relationship_manager_id      UUID,
  assigned_team_id             UUID,
  assigned_analyst_id          UUID,
  asset_class                  TEXT        NOT NULL,
  asset_subclass               TEXT,
  jurisdictions                JSONB       NOT NULL DEFAULT '[]',
  indicative_value_minor_units TEXT,
  currency                     TEXT,
  priority                     TEXT        NOT NULL DEFAULT 'MEDIUM'
                                 CHECK (priority IN ('LOW','MEDIUM','HIGH','URGENT')),
  status                       TEXT        NOT NULL
                                 CHECK (status IN (
                                   'DRAFT','SUBMITTED','INTAKE','SCREENING','QUALIFICATION',
                                   'DUE_DILIGENCE','VALUATION','ASSET_RISK_REVIEW',
                                   'READY_FOR_APPROVAL','APPROVAL_IN_PROGRESS','APPROVED',
                                   'ENGINEERING_READY','REJECTED','WITHDRAWN','ON_HOLD','SUPERSEDED'
                                 )),
  next_action                  TEXT,
  next_action_due              TIMESTAMPTZ,
  duplicate_check_status       TEXT        NOT NULL DEFAULT 'NOT_RUN'
                                 CHECK (duplicate_check_status IN ('NOT_RUN','IN_PROGRESS','CHECKED','FAILED','SUPERSEDED')),
  initial_screening_status     TEXT        NOT NULL DEFAULT 'NOT_RUN'
                                 CHECK (initial_screening_status IN ('NOT_RUN','PENDING','CLEARED','FLAGGED','NEEDS_REVIEW')),
  submitted_at                 TIMESTAMPTZ,
  received_at                  TIMESTAMPTZ,
  version                      INTEGER     NOT NULL DEFAULT 0,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_origination_cases_tenant_id  ON origination_cases (tenant_id);
CREATE INDEX idx_origination_cases_case_number ON origination_cases (case_number);
CREATE INDEX idx_origination_cases_status      ON origination_cases (status);

-- ─── Submissions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS submissions (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID        NOT NULL,
  case_id         UUID        NOT NULL,
  version         INTEGER     NOT NULL DEFAULT 1,
  source          TEXT        NOT NULL,
  channel         TEXT        NOT NULL,
  payload         JSONB       NOT NULL DEFAULT '{}',
  documents       JSONB       NOT NULL DEFAULT '[]',
  status          TEXT        NOT NULL,
  acknowledged_at TIMESTAMPTZ,
  rejection_reason TEXT,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_by    UUID        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_submissions_tenant_id ON submissions (tenant_id);
CREATE INDEX idx_submissions_case_id   ON submissions (case_id);

-- ─── Asset Counterparties ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_counterparties (
  id                     UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id              UUID        NOT NULL,
  asset_id               UUID        NOT NULL,
  entity_id              UUID,
  person_id              UUID,
  counterparty_type      TEXT        NOT NULL,
  role                   TEXT        NOT NULL,
  legal_role             TEXT,
  economic_role          TEXT,
  ownership_percentage   DOUBLE PRECISION,
  effective_from         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to           TIMESTAMPTZ,
  verification_status    TEXT        NOT NULL DEFAULT 'UNVERIFIED'
                           CHECK (verification_status IN ('UNVERIFIED','PENDING','VERIFIED','REJECTED','EXPIRED')),
  compliance_status      TEXT,
  evidence_references    JSONB       NOT NULL DEFAULT '[]',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_asset_counterparties_tenant_id ON asset_counterparties (tenant_id);
CREATE INDEX idx_asset_counterparties_asset_id  ON asset_counterparties (asset_id);

-- ─── Ownership ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ownership (
  id                              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id                       UUID        NOT NULL,
  asset_id                        UUID        NOT NULL,
  entity_id                       UUID,
  person_id                       UUID,
  ownership_type                  TEXT        NOT NULL,
  ownership_percentage            DOUBLE PRECISION,
  economic_interest_percentage    DOUBLE PRECISION,
  control_percentage              DOUBLE PRECISION,
  acquisition_date                TIMESTAMPTZ,
  effective_from                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to                    TIMESTAMPTZ,
  evidence_references             JSONB       NOT NULL DEFAULT '[]',
  verification_status             TEXT        NOT NULL DEFAULT 'UNVERIFIED'
                                    CHECK (verification_status IN ('UNVERIFIED','PENDING','VERIFIED','REJECTED','EXPIRED')),
  verified_by                     UUID,
  verified_at                     TIMESTAMPTZ,
  notes                           TEXT,
  version                         INTEGER     NOT NULL DEFAULT 0,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ownership_tenant_id ON ownership (tenant_id);
CREATE INDEX idx_ownership_asset_id  ON ownership (asset_id);

-- ─── Asset Rights ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_rights (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             UUID        NOT NULL,
  asset_id              UUID        NOT NULL,
  right_type            TEXT        NOT NULL,
  holder_entity_id      UUID,
  holder_person_id      UUID,
  percentage            DOUBLE PRECISION,
  priority              INTEGER,
  effective_from        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to          TIMESTAMPTZ,
  transferable          BOOLEAN     NOT NULL DEFAULT TRUE,
  assignable            BOOLEAN     NOT NULL DEFAULT TRUE,
  evidence_references   JSONB       NOT NULL DEFAULT '[]',
  version               INTEGER     NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_asset_rights_tenant_id ON asset_rights (tenant_id);
CREATE INDEX idx_asset_rights_asset_id  ON asset_rights (asset_id);

-- ─── Asset Encumbrances ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_encumbrances (
  id                     UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id              UUID        NOT NULL,
  asset_id               UUID        NOT NULL,
  type                   TEXT        NOT NULL,
  holder_entity_id       UUID,
  amount_minor_units     TEXT,
  currency               TEXT,
  priority               INTEGER,
  registration_number    TEXT,
  effective_from         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to           TIMESTAMPTZ,
  status                 TEXT        NOT NULL DEFAULT 'ACTIVE'
                           CHECK (status IN ('ACTIVE','RELEASED','EXTINGUISHED','DISPUTED','SUPERSEDED')),
  release_conditions     TEXT,
  evidence_references    JSONB       NOT NULL DEFAULT '[]',
  verification_status    TEXT        NOT NULL DEFAULT 'UNVERIFIED',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_asset_encumbrances_tenant_id ON asset_encumbrances (tenant_id);
CREATE INDEX idx_asset_encumbrances_asset_id  ON asset_encumbrances (asset_id);

-- ─── Asset Transferability ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_transferability (
  id                               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id                         UUID        NOT NULL,
  asset_id                          UUID        NOT NULL,
  transferable                      BOOLEAN     NOT NULL DEFAULT TRUE,
  assignable                        BOOLEAN     NOT NULL DEFAULT TRUE,
  fractionalizable                  BOOLEAN     NOT NULL DEFAULT FALSE,
  tokenizable                       BOOLEAN     NOT NULL DEFAULT FALSE,
  beneficial_interest_transferable  BOOLEAN     NOT NULL DEFAULT TRUE,
  issuer_consent_required           BOOLEAN     NOT NULL DEFAULT FALSE,
  owner_consent_required            BOOLEAN     NOT NULL DEFAULT FALSE,
  regulator_approval_required       BOOLEAN     NOT NULL DEFAULT FALSE,
  geographic_restrictions           JSONB       NOT NULL DEFAULT '[]',
  investor_restrictions             JSONB       NOT NULL DEFAULT '[]',
  secondary_transfer_restrictions   JSONB       NOT NULL DEFAULT '[]',
  lockup_days                       INTEGER,
  pre_emption_rights                BOOLEAN     NOT NULL DEFAULT FALSE,
  transfer_fees                     TEXT,
  transfer_documentation            TEXT,
  legal_opinion_required            BOOLEAN     NOT NULL DEFAULT FALSE,
  status                            TEXT        NOT NULL DEFAULT 'NOT_ASSESSED',
  evidence_references               JSONB       NOT NULL DEFAULT '[]',
  reviewer                          UUID,
  assessment_date                   TIMESTAMPTZ,
  review_decision                   TEXT,
  notes                             TEXT,
  created_at                        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_asset_transferability_tenant_id ON asset_transferability (tenant_id);
CREATE INDEX idx_asset_transferability_asset_id  ON asset_transferability (asset_id);

-- ─── Asset Provenance ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_provenance (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             UUID        NOT NULL,
  asset_id              UUID        NOT NULL,
  event_type            TEXT        NOT NULL,
  from_entity_id        UUID,
  to_entity_id          UUID,
  effective_date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_date         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  jurisdiction          TEXT,
  registry_reference    TEXT,
  document_reference    TEXT,
  transaction_reference TEXT,
  verification_status   TEXT        NOT NULL DEFAULT 'UNVERIFIED',
  evidence_references   JSONB       NOT NULL DEFAULT '[]',
  hash                  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_asset_provenance_tenant_id ON asset_provenance (tenant_id);
CREATE INDEX idx_asset_provenance_asset_id  ON asset_provenance (asset_id);

-- ─── Evidence ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evidence (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             UUID        NOT NULL,
  asset_id              UUID,
  case_id               UUID,
  evidence_type         TEXT        NOT NULL,
  source                TEXT        NOT NULL,
  source_reference      TEXT,
  evidence_date         TIMESTAMPTZ,
  collected_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  collected_by          UUID        NOT NULL,
  confidence            INTEGER     CHECK (confidence BETWEEN 0 AND 100),
  verification_status   TEXT        NOT NULL DEFAULT 'UNVERIFIED',
  document_id           UUID,
  external_reference    TEXT,
  hash                  TEXT,
  signature             TEXT,
  expiry                TIMESTAMPTZ,
  access_policy         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_tenant_id ON evidence (tenant_id);
CREATE INDEX idx_evidence_asset_id  ON evidence (asset_id);
CREATE INDEX idx_evidence_case_id   ON evidence (case_id);

-- ─── Asset Claims ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_claims (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id            UUID        NOT NULL,
  asset_id             UUID        NOT NULL,
  claim_statement      TEXT        NOT NULL,
  claim_type           TEXT        NOT NULL,
  claim_owner          UUID        NOT NULL,
  materiality          TEXT        NOT NULL,
  status               TEXT        NOT NULL DEFAULT 'DRAFT',
  verification_method  TEXT,
  evidence_references  JSONB       NOT NULL DEFAULT '[]',
  confidence           INTEGER     CHECK (confidence BETWEEN 0 AND 100),
  reviewer             UUID,
  verified_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rejection_reason     TEXT,
  version              INTEGER     NOT NULL DEFAULT 0,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_asset_claims_tenant_id ON asset_claims (tenant_id);
CREATE INDEX idx_asset_claims_asset_id  ON asset_claims (asset_id);

-- ─── Data Requests ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS data_requests (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id            UUID        NOT NULL,
  case_id              UUID        NOT NULL,
  requested_from       TEXT        NOT NULL,
  requested_by         TEXT        NOT NULL,
  request_type         TEXT        NOT NULL,
  description          TEXT        NOT NULL,
  priority             TEXT        NOT NULL DEFAULT 'MEDIUM',
  required_by          TIMESTAMPTZ,
  status               TEXT        NOT NULL DEFAULT 'REQUESTED',
  response             TEXT,
  evidence_references  JSONB       NOT NULL DEFAULT '[]',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at         TIMESTAMPTZ,
  version              INTEGER     NOT NULL DEFAULT 0,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_data_requests_tenant_id ON data_requests (tenant_id);
CREATE INDEX idx_data_requests_case_id   ON data_requests (case_id);

-- ─── Row-Level Security ──────────────────────────────────────────────────
ALTER TABLE origination_cases      ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_counterparties   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ownership              ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_rights           ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_encumbrances     ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_transferability  ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_provenance       ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence               ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_claims           ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_requests          ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_origination_cases ON origination_cases
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_submissions ON submissions
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_asset_counterparties ON asset_counterparties
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_ownership ON ownership
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_asset_rights ON asset_rights
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_asset_encumbrances ON asset_encumbrances
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_asset_transferability ON asset_transferability
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_asset_provenance ON asset_provenance
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_evidence ON evidence
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_asset_claims ON asset_claims
  USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation_data_requests ON data_requests
  USING (tenant_id = current_tenant_id());
