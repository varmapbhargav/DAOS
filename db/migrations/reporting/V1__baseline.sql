-- ============================================================
-- Reporting — baseline schema (V1)
-- Schema: reporting
-- ============================================================

SET search_path TO reporting;
SELECT set_config('search_path', 'reporting,pg_catalog', false);

-- ─── Cap Tables ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cap_tables (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID        NOT NULL,
  issuance_id         UUID        NOT NULL,
  total_shares_issued BIGINT      NOT NULL DEFAULT 0,
  last_synced_at      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cap_tables_tenant_id   ON cap_tables (tenant_id);
CREATE INDEX idx_cap_tables_issuance_id ON cap_tables (issuance_id);

-- ─── Documents ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID        NOT NULL,
  category            TEXT        NOT NULL,
  entity_type         TEXT        NOT NULL,
  entity_id           UUID        NOT NULL,
  current_version_id  UUID,
  status              TEXT        NOT NULL DEFAULT 'active',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_tenant_id ON documents (tenant_id);

-- ─── Document Versions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_versions (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id     UUID        NOT NULL,
  tenant_id       UUID        NOT NULL,
  version_number  INTEGER     NOT NULL DEFAULT 1,
  file_ref        TEXT        NOT NULL,
  checksum        TEXT        NOT NULL,
  uploaded_by     UUID        NOT NULL,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mime_type       TEXT        NOT NULL
);

CREATE INDEX idx_document_versions_document_id ON document_versions (document_id);
CREATE INDEX idx_document_versions_tenant_id   ON document_versions (tenant_id);

-- ─── Investor Statements ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investor_statements (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID        NOT NULL,
  investor_id       UUID        NOT NULL,
  product_id        UUID        NOT NULL,
  period_start      TIMESTAMPTZ NOT NULL,
  period_end        TIMESTAMPTZ NOT NULL,
  frequency         TEXT        NOT NULL,
  opening_nav       NUMERIC     NOT NULL,
  closing_nav       NUMERIC     NOT NULL,
  contributions     NUMERIC     NOT NULL,
  distributions     NUMERIC     NOT NULL,
  unrealized_gain   NUMERIC     NOT NULL,
  realized_gain     NUMERIC     NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'draft',
  distributed_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_investor_statements_tenant_id   ON investor_statements (tenant_id);
CREATE INDEX idx_investor_statements_investor_id ON investor_statements (investor_id);
CREATE INDEX idx_investor_statements_product_id  ON investor_statements (product_id);

-- ─── NAV Calculations ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nav_calculations (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID        NOT NULL,
  product_id          UUID        NOT NULL,
  share_class_id      UUID        NOT NULL,
  calculation_date    TIMESTAMPTZ NOT NULL,
  gross_asset_value   NUMERIC     NOT NULL,
  total_liabilities   NUMERIC     NOT NULL,
  net_asset_value     NUMERIC     NOT NULL,
  nav_per_share       NUMERIC     NOT NULL,
  units_outstanding   BIGINT      NOT NULL,
  status              TEXT        NOT NULL DEFAULT 'preliminary',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nav_calculations_tenant_id  ON nav_calculations (tenant_id);
CREATE INDEX idx_nav_calculations_product_id ON nav_calculations (product_id);

-- ─── Performance Metrics ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS performance_metrics (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID        NOT NULL,
  product_id      UUID        NOT NULL,
  as_of_date      TIMESTAMPTZ NOT NULL,
  irr             NUMERIC     NOT NULL,
  moic            NUMERIC     NOT NULL,
  dpi             NUMERIC     NOT NULL,
  tvpi            NUMERIC     NOT NULL,
  rvpi            NUMERIC     NOT NULL,
  alpha           NUMERIC,
  beta            NUMERIC,
  sharpe_ratio    NUMERIC,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_performance_metrics_tenant_id  ON performance_metrics (tenant_id);
CREATE INDEX idx_performance_metrics_product_id ON performance_metrics (product_id);

-- ─── Shareholder Records ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shareholder_records (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  cap_table_id      UUID        NOT NULL,
  investor_id       UUID        NOT NULL,
  share_class       TEXT        NOT NULL,
  quantity          BIGINT      NOT NULL DEFAULT 0,
  acquired_at       TIMESTAMPTZ NOT NULL,
  acquisition_price NUMERIC     NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shareholder_records_cap_table_id ON shareholder_records (cap_table_id);
CREATE INDEX idx_shareholder_records_investor_id  ON shareholder_records (investor_id);

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
ALTER TABLE cap_tables           ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_statements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_calculations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics  ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareholder_records  ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_cap_tables ON cap_tables
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_documents ON documents
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_document_versions ON document_versions
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_investor_statements ON investor_statements
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_nav_calculations ON nav_calculations
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_performance_metrics ON performance_metrics
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_shareholder_records ON shareholder_records
  USING (tenant_id = current_tenant_id());
