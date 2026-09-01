-- Executed once when the PostgreSQL container first starts.
-- Creates one dedicated DATABASE per microservice (Database-per-Service pattern).
-- Each bounded context owns its entire database — no schema sharing, no
-- cross-service queries, full data isolation.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- One database per microservice
CREATE DATABASE daos;
CREATE DATABASE daos_tenant_identity;
CREATE DATABASE daos_investor_management;
CREATE DATABASE daos_asset_origination;
CREATE DATABASE daos_opportunity_engineering;
CREATE DATABASE daos_deal_studio;
CREATE DATABASE daos_legal_entity_studio;
CREATE DATABASE daos_product_design_studio;
CREATE DATABASE daos_issuance_studio;
CREATE DATABASE daos_distribution;
CREATE DATABASE daos_marketplace;
CREATE DATABASE daos_settlement;
CREATE DATABASE daos_waterfall_engine;
CREATE DATABASE daos_compliance;
CREATE DATABASE daos_reporting;
CREATE DATABASE daos_document_management;
CREATE DATABASE daos_cap_table;
CREATE DATABASE daos_notification;
CREATE DATABASE daos_wallet_custody;
CREATE DATABASE daos_pricing_valuation;
CREATE DATABASE daos_risk_management;
CREATE DATABASE daos_governance;
CREATE DATABASE daos_tenant_organization;