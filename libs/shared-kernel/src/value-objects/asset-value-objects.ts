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

export type ValuationMethodology = 'dcf' | 'comps' | 'nav' | 'costApproach' | 'incomeApproach';

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
