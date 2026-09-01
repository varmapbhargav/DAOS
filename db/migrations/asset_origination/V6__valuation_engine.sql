-- ============================================================
-- Asset Origination — V6: valuation engine
-- Schema: asset_origination
-- ============================================================

SET search_path TO asset_origination;
SELECT set_config('search_path', 'asset_origination,pg_catalog', false);

-- ─── Valuations ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS valuations (
  id                       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id                UUID        NOT NULL,
  case_id                  UUID        NOT NULL,
  status                   TEXT        NOT NULL DEFAULT 'REQUESTED'
                               CHECK (status IN ('REQUESTED','ASSIGNED','UPLOADED','IN_REVIEW','APPROVED','REJECTED')),
  current_market_value     NUMERIC(18,2),
  fair_value               NUMERIC(18,2),
  book_value               NUMERIC(18,2),
  nav                      NUMERIC(18,2),
  face_value               NUMERIC(18,2),
  outstanding_principal    NUMERIC(18,2),
  indicative_acquisition_value NUMERIC(18,2),
  purchase_price           NUMERIC(18,2),
  valuation_date           TIMESTAMPTZ,
  valuation_source         TEXT,
  valuer                   UUID,
  methodology              TEXT
                               CHECK (methodology IN (
                                 'MARKET_COMPARABLES','INCOME_APPROACH','COST_APPROACH','DISCOUNTED_CASH_FLOW',
                                 'PRECEDENT_TRANSACTIONS','APPRaisal','BROKER_OPINION','OTHER')),
  confidence               INTEGER     CHECK (confidence BETWEEN 0 AND 100),
  currency                 CHAR(3)     NOT NULL DEFAULT 'USD'
                               CHECK (currency IN ('USD','EUR','GBP','CHF','JPY','CAD','AUD','SGD','HKD')),
  reviewer                 UUID,
  reviewed_at              TIMESTAMPTZ,
  approval_reason          TEXT,
  rejection_reason         TEXT,
  requested_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_at              TIMESTAMPTZ,
  uploaded_at              TIMESTAMPTZ,
  approved_at              TIMESTAMPTZ,
  rejected_at              TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_valuations_tenant_id ON valuations (tenant_id);
CREATE INDEX idx_valuations_case_id   ON valuations (case_id);
CREATE INDEX idx_valuations_status    ON valuations (status);

-- ─── Row-Level Security ─────────────────────────────────────────────────
ALTER TABLE valuations ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_valuations ON valuations
  USING (tenant_id = current_tenant_id());