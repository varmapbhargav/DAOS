// Asset Origination Value Objects
import { Money, UtcInstant } from '@daos/shared-kernel';

export type AssetClass =
  | 'realEstate'
  | 'privateEquity'
  | 'privateCredit'
  | 'infrastructure'
  | 'ventureCapital'
  | 'commodities'
  | 'digitalAssets';

export type AssetSubClass =
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'hospitality'
  | 'retail'
  | 'land'
  | 'mixedUse'
  | 'corporateLoan'
  | 'assetBackedLoan'
  | 'realEstateLoan'
  | 'tradeFinance'
  | 'receivablesFinancing'
  | 'energy'
  | 'transport'
  | 'telecom'
  | 'utilities'
  | 'digitalInfrastructure'
  | 'buyout'
  | 'growth'
  | 'venture'
  | 'secondary';

export type AssetOriginationStatus =
  | 'DRAFT'                    // Initial creation
  | 'ORIGINATED'               // Formal origination
  | 'SCREENING'                // Eligibility screening
  | 'QUALIFIED'                // Passed screening
  | 'DUE_DILIGENCE'            // DD in progress
  | 'VALUATION'                // Valuation in progress
  | 'RISK_REVIEW'              // Risk assessment
  | 'READY_FOR_APPROVAL'       // Submitted for approval
  | 'APPROVED'                 // Investment committee approved
  | 'REJECTED'                 // Rejected at any stage
  | 'ON_HOLD'                  // Paused
  | 'WITHDRAWN'                // Sponsor withdrew
  | 'HANDED_OFF_TO_DEAL';      // Moved to Deal Studio

// Legacy type alias for backward compatibility during migration
export type AssetStatus = AssetOriginationStatus;

export type AssetIdentity = {
  externalReference: string | null;
  internalReference: string | null;
  legalName: string;
  assetClass: AssetClass;
  assetSubclass: AssetSubClass;
  country: string;
  jurisdictions: string[];
};

export type Collateral = {
  type: string;
  description: string;
  estimatedValue: Money;
  lienPosition: number;
};

export type ProvenanceRecord = {
  sourceType: 'sponsor' | 'broker' | 'portfolio' | 'inbound';
  sourceRef: string;
  documentedAt: UtcInstant;
  priorOwners: string[];
};

export type Finding = {
  category: string;
  severity: 'info' | 'warning' | 'critical';
  description: string;
  status: 'open' | 'resolved' | 'waived';
};

export type DDRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'D';

export type ScreeningDecision = 'PASS' | 'FAIL' | 'CONDITIONAL' | 'REQUIRES_REVIEW';

export type ScreeningCriterionResult = 'PASS' | 'FAIL' | 'CONDITIONAL' | 'NOT_APPLICABLE';

export interface ScreeningCriteria {
  assetClassEligibility: Record<AssetClass, boolean>;
  jurisdictionEligibility: Record<string, boolean>;
  minimumAssetValue?: Money;
  maximumAssetValue?: Money;
  minimumExpectedReturn?: number;
  sponsorEligibility: Record<string, boolean>;
  regulatoryRestrictions: string[];
  esgRestrictions: string[];
  liquidityRequirements: {
    minimumDailyLiquidity: Money;
    maximumLockupPeriodDays: number;
  };
  tenantInvestmentMandates: string[];
}

export interface ScreeningResult {
  decision: ScreeningDecision;
  score: number;
  maxScore: number;
  criteriaResults: Record<string, ScreeningCriterionResult>;
  comments: string;
  reviewedBy: string;
  reviewedAt: UtcInstant;
}

export type QualificationDecision = 'QUALIFIED' | 'DISQUALIFIED' | 'CONDITIONAL';

export interface AssetQualificationCriteria {
  investmentThesisFit: {
    assetClassFit: boolean;
    geographicFit: boolean;
    thesisAlignment: boolean;
  };
  ticketSizeFit: {
    minimumTicket: Money | null;
    maximumTicket: Money | null;
    assetTicketSize: number;
    fitsRange: boolean;
  };
  expectedReturnFit: {
    minimumExpectedReturn: number | null;
    maximumExpectedReturn: number | null;
    assetExpectedReturn: number;
    meetsCriteria: boolean;
  };
  riskAppetiteFit: {
    maximumRiskRating: DDRating | null;
    assetRiskRating: DDRating | null;
    withinAppetite: boolean;
  };
  liquidityFit: {
    minimumLiquidity: Money | null;
    assetLiquidity: Money;
    meetsLiquidityRequirements: boolean;
  };
  sponsorQualityFit: {
    sponsorTrackRecord: string;
    sponsorRating: string;
    dueDiligenceCompleted: boolean;
    meetsSponsorCriteria: boolean;
  };
  esgFit: {
    esgScreeningPassed: boolean;
    esgCommitments: string[];
    meetsESGCriteria: boolean;
  };
  dataCompleteness: {
    allRequiredDocuments: boolean;
    documentChecklist: Record<string, boolean>;
    completenessPercentage: number;
  };
}

export interface AssetQualificationScore {
  investmentFit: number;        // 0-100
  riskScore: number;            // 0-100 (inverted - higher risk = lower score)
  sponsorScore: number;         // 0-100
  liquidityScore: number;       // 0-100
  esgScore: number;             // 0-100
  dataCompleteness: number;     // 0-100
  overallScore: number;         // 0-100
}

export interface AssetQualificationResult {
  qualificationId: string;
  assetId: string;
  decision: QualificationDecision;
  score: AssetQualificationScore;
  criteria: AssetQualificationCriteria;
  explanation: string;
  qualifiedBy: string;
  qualifiedAt: UtcInstant;
  weightConfiguration: Record<keyof AssetQualificationScore, number>;
  tenantId: string;
}

export type OriginationSourceType = 'DIRECT' | 'SPONSOR' | 'BROKER' | 'ADVISOR' | 'MARKETPLACE' | 'PORTFOLIO' | 'REFERRAL' | 'INBOUND' | 'API' | 'PARTNER';

export interface OriginationSource {
  sourceId: string;
  sourceType: OriginationSourceType;
  sourceEntityId: string;
  sourceReference: string;
  originatedAt: UtcInstant;
  submittedBy: string;
  relationshipManager: string;
}

// ---------------------------------------------------------------------------
// Origination Case
// ---------------------------------------------------------------------------

export type OriginationCaseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'INTAKE'
  | 'SCREENING'
  | 'QUALIFICATION'
  | 'DUE_DILIGENCE'
  | 'VALUATION'
  | 'ASSET_RISK_REVIEW'
  | 'READY_FOR_APPROVAL'
  | 'APPROVAL_IN_PROGRESS'
  | 'APPROVED'
  | 'ENGINEERING_READY'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'ON_HOLD'
  | 'SUPERSEDED';

export type SubmissionType = 'MANUAL' | 'EXTERNAL_PORTAL' | 'API' | 'BULK_IMPORT' | 'PARTNER' | 'REFFERAL';

export type SubmissionChannel = 'INTERNAL' | 'PORTAL' | 'EMAIL' | 'API' | 'SFTP' | 'CSV' | 'EXCEL' | 'JSON';

export type DuplicateCheckStatus = 'NOT_RUN' | 'IN_PROGRESS' | 'NO_DUPLICATE' | 'DUPLICATE_FOUND' | 'RESOLVED_LINKED' | 'RESOLVED_SEPARATE';

export type InitialScreeningStatus = 'NOT_RUN' | 'PASS' | 'FAIL' | 'CONDITIONAL' | 'MANUAL_REVIEW';

export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// ---------------------------------------------------------------------------
// Asset Counterparty
// ---------------------------------------------------------------------------

export type CounterpartyRole =
  | 'OWNER'
  | 'BENEFICIAL_OWNER'
  | 'SELLER'
  | 'BUYER'
  | 'BORROWER'
  | 'LENDER'
  | 'ISSUER'
  | 'SPONSOR'
  | 'OPERATOR'
  | 'SERVICER'
  | 'CUSTODIAN'
  | 'TRUSTEE'
  | 'ADMINISTRATOR'
  | 'MANAGER'
  | 'VALUER'
  | 'AUDITOR'
  | 'LEGAL_ADVISOR'
  | 'BROKER'
  | 'ORIGINATOR'
  | 'INSURER'
  | 'REGULATOR'
  | 'SECURITY_HOLDER';

export type CounterpartyVerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

// ---------------------------------------------------------------------------
// Ownership
// ---------------------------------------------------------------------------

export type OwnershipType = 'LEGAL' | 'ECONOMIC' | 'BENEFICIAL' | 'CONTROL' | 'NOMINEE' | 'TRUST';

export type OwnershipVerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

// ---------------------------------------------------------------------------
// Asset Rights
// ---------------------------------------------------------------------------

export type RightType =
  | 'OWNERSHIP'
  | 'BENEFICIAL_INTEREST'
  | 'REVENUE_RIGHT'
  | 'INCOME_RIGHT'
  | 'DEBT_CLAIM'
  | 'SECURITY_INTEREST'
  | 'VOTING_RIGHT'
  | 'REDEMPTION_RIGHT'
  | 'ROYALTY_RIGHT'
  | 'LEASE_RIGHT'
  | 'PROFIT_PARTICIPATION'
  | 'GOVERNANCE_RIGHT';

// ---------------------------------------------------------------------------
// Encumbrance
// ---------------------------------------------------------------------------

export type EncumbranceType =
  | 'MORTGAGE'
  | 'LIEN'
  | 'PLEDGE'
  | 'CHARGE'
  | 'SECURITY_INTEREST'
  | 'DEBT'
  | 'CLAIM'
  | 'LITIGATION_CLAIM'
  | 'TRANSFER_RESTRICTION';

export type EncumbranceStatus = 'ACTIVE' | 'RELEASED' | 'EXPIRED' | 'VOID';

// ---------------------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------------------

export type ProvenanceEventType =
  | 'CREATED'
  | 'ACQUIRED'
  | 'TRANSFERRED'
  | 'ASSIGNED'
  | 'PLEDGED'
  | 'RELEASED'
  | 'VALUED'
  | 'RESTRUCTURED'
  | 'SPLIT'
  | 'MERGED'
  | 'TOKENIZED'
  | 'REDEEMED'
  | 'RETIRED';

export type ProvenanceVerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export type EvidenceType =
  | 'REGISTRY_RECORD'
  | 'BLOCKCHAIN_TRANSACTION'
  | 'API_RESPONSE'
  | 'CUSTODIAN_CONFIRMATION'
  | 'BANK_STATEMENT'
  | 'LEGAL_OPINION'
  | 'EXTERNAL_DATABASE'
  | 'VALUATION_REPORT'
  | 'COUNTERPARTY_ATTESTATION'
  | 'ORACLE_DATA'
  | 'PHOTOGRAPH'
  | 'INSPECTION_REPORT'
  | 'CERTIFICATE';

export type EvidenceVerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

// ---------------------------------------------------------------------------
// Claims
// ---------------------------------------------------------------------------

export type ClaimTypeRule = 'FACT' | 'LEGAL' | 'COMPLIANCE' | 'OPERATIONAL' | 'VERIFICATION';

export type ClaimStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'EXPIRED' | 'RE_VERIFICATION';

export type VerificationMethod = 'MANUAL' | 'DOCUMENT_REVIEW' | 'REGISTRY_SEARCH' | 'API' | 'ORACLE' | 'AI_ASSISTED' | 'LEGAL_OPINION';

// ---------------------------------------------------------------------------
// Transferability
// ---------------------------------------------------------------------------

export type TransferabilityStatus = 'NOT_ASSESSED' | 'ASSESSMENT_IN_PROGRESS' | 'ASSESSED' | 'REVIEWED';

export type TransferabilityReviewDecision = 'TRANSFERABLE' | 'TRANSFERABLE_WITH_CONDITIONS' | 'NOT_TRANSFERABLE';

// ---------------------------------------------------------------------------
// Data Requests
// ---------------------------------------------------------------------------

export type DataRequestStatus =
  | 'REQUESTED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'OVERDUE'
  | 'CANCELLED';

export type DataRequestType = 'DOCUMENT' | 'INFORMATION' | 'CLARIFICATION' | 'EVIDENCE' | 'DECLARATION';

// ---------------------------------------------------------------------------
// Screening Result (case-level)
// ---------------------------------------------------------------------------

export type ScreeningResultStatus = 'PENDING' | 'PASS' | 'FAIL' | 'CONDITIONAL' | 'MANUAL_REVIEW';

export type ScreeningCriterionOutcome = {
  rule: string;
  result: 'PASS' | 'FAIL' | 'CONDITIONAL' | 'NOT_APPLICABLE';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  evidence: string | null;
  explanation: string | null;
  overrideBy: string | null;
  overrideReason: string | null;
};

// ---------------------------------------------------------------------------
// Qualification Result (case-level)
// ---------------------------------------------------------------------------

export type QualificationResultStatus = 'PENDING' | 'QUALIFIED' | 'DISQUALIFIED' | 'CONDITIONAL';

export type QualificationScoreBreakdown = {
  identityComplete: boolean;
  ownershipComplete: boolean;
  legalComplete: boolean;
  evidenceComplete: boolean;
  complianceComplete: boolean;
  ddComplete: boolean;
  valuationComplete: boolean;
  transferabilityComplete: boolean;
  dataQualityScore: number;
  riskScore: number;
  overallScore: number;
};

export type QualificationBlocker = {
  category: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  resolution: string | null;
};

// ---------------------------------------------------------------------------
// Completeness Engine (case-level)
// ---------------------------------------------------------------------------

export type CompletenessDimension =
  | 'IDENTITY'
  | 'OWNERSHIP'
  | 'RIGHTS'
  | 'EVIDENCE'
  | 'LEGAL'
  | 'COUNTERPARTY'
  | 'FINANCIAL_DATA'
  | 'VALUATION'
  | 'DUE_DILIGENCE'
  | 'RISK'
  | 'COMPLIANCE';

export type CompletenessBreakdown = {
  identity: number;
  ownership: number;
  rights: number;
  evidence: number;
  legal: number;
  counterparty: number;
  financialData: number;
  valuation: number;
  dueDiligence: number;
  risk: number;
  compliance: number;
  overall: number;
};

// ---------------------------------------------------------------------------
// Blocker Engine (case-level)
// ---------------------------------------------------------------------------

export type BlockerSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type BlockerResolutionStatus = 'OPEN' | 'RESOLVED' | 'WAIVED';

// ---------------------------------------------------------------------------
// Due Diligence (case-level)
// ---------------------------------------------------------------------------

export type DueDiligenceStatus = 'IN_PROGRESS' | 'COMPLETED';

export type DdCategory =
  | 'LEGAL'
  | 'FINANCIAL'
  | 'TAX'
  | 'COMMERCIAL'
  | 'REGULATORY'
  | 'OPERATIONAL'
  | 'TECHNICAL'
  | 'ESG'
  | 'INSURANCE'
  | 'CYBER'
  | 'DIGITAL_ASSET'
  | 'CUSTODY'
  | 'SMART_CONTRACT';

export type DdSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type DdFindingStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'WAIVED';

// ---------------------------------------------------------------------------
// Asset-Level Risk (case-level)
// ---------------------------------------------------------------------------

export type RiskCategory =
  | 'OWNERSHIP'
  | 'LEGAL'
  | 'DOCUMENTATION'
  | 'COUNTERPARTY'
  | 'JURISDICTION'
  | 'REGULATORY_ELIGIBILITY'
  | 'VALUATION_CONFIDENCE'
  | 'DATA_QUALITY'
  | 'OPERATIONAL'
  | 'MARKET'
  | 'TECHNOLOGY'
  | 'SMART_CONTRACT'
  | 'CUSTODY'
  | 'CONCENTRATION'
  | 'FRAUD_PROVENANCE';

export type RiskProbability = 'LOW' | 'MEDIUM' | 'HIGH';

export type RiskImpact = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskItemStatus = 'OPEN' | 'MITIGATED' | 'ACCEPTED';

// ---------------------------------------------------------------------------
// Valuation (case-level)
// ---------------------------------------------------------------------------

export type ValuationStatus =
  | 'REQUESTED'
  | 'ASSIGNED'
  | 'UPLOADED'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export type ValuationMethodology =
  | 'MARKET_COMPARABLES'
  | 'INCOME_APPROACH'
  | 'COST_APPROACH'
  | 'DISCOUNTED_CASH_FLOW'
  | 'PRECEDENT_TRANSACTIONS'
  | 'APPRaisal'
  | 'BROKER_OPINION'
  | 'OTHER';

export type ValuationCurrency = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'JPY' | 'CAD' | 'AUD' | 'SGD' | 'HKD';

// ---------------------------------------------------------------------------
// Approval Engine (case-level)
// ---------------------------------------------------------------------------

export type CaseApprovalStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'APPROVED'
  | 'REJECTED'
  | 'CONDITIONALLY_APPROVED'
  | 'REQUESTED_CHANGES';

export type ApprovalLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5';

export type ApprovalType =
  | 'SINGLE'
  | 'MULTI_LEVEL_SEQUENTIAL'
  | 'MULTI_LEVEL_PARALLEL'
  | 'CONDITIONAL'
  | 'DELEGATED';

export type ApprovalDecisionType = 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';

// ---------------------------------------------------------------------------
// Engineering Readiness (case-level)
// ---------------------------------------------------------------------------

export type EngineeringReadinessStatus = 'READY' | 'CONDITIONALLY_READY' | 'NOT_READY';

export type EngineeringReadinessCheck =
  | 'ASSET_IDENTITY'
  | 'OWNERSHIP'
  | 'BENEFICIAL_OWNERSHIP'
  | 'LEGAL_RIGHTS'
  | 'TRANSFERABILITY'
  | 'PROVENANCE'
  | 'EVIDENCE'
  | 'COUNTERPARTIES'
  | 'COMPLIANCE'
  | 'DD'
  | 'VALUATION'
  | 'ASSET_RISK'
  | 'DATA_COMPLETENESS'
  | 'CRITICAL_BLOCKERS'
  | 'HIGH_BLOCKERS'
  | 'OPEN_EXCEPTIONS';

// ---------------------------------------------------------------------------
// Asset Pooling
// ---------------------------------------------------------------------------

export type PoolType =
  | 'REVOLVING'
  | 'STATIC'
  | 'DYNAMIC'
  | 'WAREHOUSE'
  | 'SECURITIZATION'
  | 'FUND';

export type PoolStrategy =
  | 'DIVERSIFIED'
  | 'SECTOR_FOCUSED'
  | 'GEOGRAPHIC_FOCUSED'
  | 'ASSET_CLASS_FOCUSED'
  | 'YIELD_OPTIMIZED'
  | 'RISK_BALANCED';

export type PoolStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'CLOSED'
  | 'LIQUIDATING'
  | 'LIQUIDATED'
  | 'SUSPENDED';

export type ConcentrationRuleType =
  | 'SINGLE_ASSET_MAX'
  | 'SECTOR_MAX'
  | 'GEOGRAPHY_MAX'
  | 'COUNTERPARTY_MAX'
  | 'ASSET_CLASS_MAX'
  | 'CURRENCY_MAX'
  | 'MATURITY_BUCKET_MAX';

export type ConcentrationRule = {
  type: ConcentrationRuleType;
  limit: number; // percentage (0-100) or absolute value
  scope?: string; // sector, geography, etc.
};

export type EligibilityPolicy = {
  minAssetValue?: number;
  maxAssetValue?: number;
  allowedAssetClasses?: string[];
  allowedJurisdictions?: string[];
  requiredCreditRating?: string;
  maxLTV?: number;
  minSeasoningMonths?: number;
  customRules?: Record<string, unknown>;
};
