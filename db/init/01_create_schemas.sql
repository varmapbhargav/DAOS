-- Executed once when the PostgreSQL container first starts.
-- Creates one schema per bounded context and enables the pgcrypto extension
-- for UUID generation within the database layer.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bounded-context schemas (one per microservice database)
CREATE SCHEMA IF NOT EXISTS tenant_identity;
CREATE SCHEMA IF NOT EXISTS investor_management;
CREATE SCHEMA IF NOT EXISTS asset_origination;
CREATE SCHEMA IF NOT EXISTS opportunity_engineering;
CREATE SCHEMA IF NOT EXISTS deal_studio;
CREATE SCHEMA IF NOT EXISTS legal_entity_studio;
CREATE SCHEMA IF NOT EXISTS product_design_studio;
CREATE SCHEMA IF NOT EXISTS issuance_studio;
CREATE SCHEMA IF NOT EXISTS distribution;
CREATE SCHEMA IF NOT EXISTS marketplace;
CREATE SCHEMA IF NOT EXISTS settlement;
CREATE SCHEMA IF NOT EXISTS waterfall_engine;
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE SCHEMA IF NOT EXISTS reporting;
CREATE SCHEMA IF NOT EXISTS document_management;
CREATE SCHEMA IF NOT EXISTS cap_table;
CREATE SCHEMA IF NOT EXISTS notification;
CREATE SCHEMA IF NOT EXISTS wallet_custody;
CREATE SCHEMA IF NOT EXISTS pricing_valuation;
CREATE SCHEMA IF NOT EXISTS risk_management;
CREATE SCHEMA IF NOT EXISTS governance;

-- Row-Level Security helper function.
-- Services call: SELECT set_config('app.tenant_id', '<uuid>', true)
-- Then each table's RLS policy references current_setting('app.tenant_id').
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS uuid
  LANGUAGE sql STABLE AS
$$
  SELECT current_setting('app.tenant_id', true)::uuid;
$$;
