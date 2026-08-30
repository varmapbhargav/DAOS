-- Compliance Schema Baseline
-- DAOS Platform - Sub-Project #10

CREATE SCHEMA IF NOT EXISTS compliance;

-- Compliance Rules Table
CREATE TABLE IF NOT EXISTS compliance.compliance_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    rule_type TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    threshold NUMERIC,
    parameters JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_rules_tenant ON compliance.compliance_rules(tenant_id);
CREATE INDEX idx_compliance_rules_type ON compliance.compliance_rules(rule_type);
CREATE INDEX idx_compliance_rules_active ON compliance.compliance_rules(is_active);

-- Regulatory Filings Table
CREATE TABLE IF NOT EXISTS compliance.regulatory_filings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    filing_type TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    product_id UUID,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'draft',
    due_date TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ,
    external_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_regulatory_filings_tenant ON compliance.regulatory_filings(tenant_id);
CREATE INDEX idx_regulatory_filings_status ON compliance.regulatory_filings(status);
CREATE INDEX idx_regulatory_filings_period ON compliance.regulatory_filings(period_start, period_end);

-- Investor Counts Table
CREATE TABLE IF NOT EXISTS compliance.investor_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    product_id UUID NOT NULL,
    regulatory_framework TEXT NOT NULL,
    current_count INTEGER DEFAULT 0,
    limit INTEGER NOT NULL,
    threshold_alert_pct NUMERIC DEFAULT 80,
    last_calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_investor_counts_product ON compliance.investor_counts(tenant_id, product_id, regulatory_framework);
CREATE INDEX idx_investor_counts_threshold ON compliance.investor_counts(current_count, limit);
