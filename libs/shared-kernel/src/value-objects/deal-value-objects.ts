// Deal Structuring Value Objects — full domain model
import { Money } from './money';
import { Percentage } from './percentage';

// ─── Deal Status ───────────────────────────────────────────────────────────────

export type DealStatus =
  | 'DRAFT'
  | 'STRUCTURING'
  | 'TERM_SHEET_READY'
  | 'LEGAL_REVIEW'
  | 'READY_FOR_APPROVAL'
  | 'APPROVED'
  | 'READY_TO_CLOSE'
  | 'CLOSING'
  | 'CLOSED'
  | 'ON_HOLD'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

/** All valid lifecycle transitions. source -> allowed targets */
export const DEAL_STATUS_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  DRAFT: ['STRUCTURING', 'CANCELLED'],
  STRUCTURING: ['TERM_SHEET_READY', 'ON_HOLD', 'CANCELLED'],
  TERM_SHEET_READY: ['LEGAL_REVIEW', 'STRUCTURING', 'ON_HOLD', 'CANCELLED'],
  LEGAL_REVIEW: ['READY_FOR_APPROVAL', 'STRUCTURING', 'ON_HOLD', 'CANCELLED'],
  READY_FOR_APPROVAL: ['APPROVED', 'REJECTED', 'LEGAL_REVIEW', 'ON_HOLD', 'CANCELLED'],
  APPROVED: ['READY_TO_CLOSE', 'ON_HOLD', 'CANCELLED'],
  READY_TO_CLOSE: ['CLOSING', 'ON_HOLD', 'CANCELLED'],
  CLOSING: ['CLOSED', 'ON_HOLD', 'CANCELLED'],
  CLOSED: [],
  ON_HOLD: ['STRUCTURING', 'TERM_SHEET_READY', 'LEGAL_REVIEW', 'READY_FOR_APPROVAL', 'APPROVED', 'READY_TO_CLOSE', 'CLOSING', 'CANCELLED'],
  REJECTED: [],
  CANCELLED: [],
  EXPIRED: [],
};

// ─── Deal Type ─────────────────────────────────────────────────────────────────

export type DealType =
  | 'ACQUISITION'
  | 'FINANCING'
  | 'REFINANCING'
  | 'RESTRUCTURING'
  | 'CO_INVESTMENT'
  | 'FUND_INVESTMENT'
  | 'ASSET_BACKED_FINANCING'
  | 'PRIVATE_CREDIT'
  | 'REAL_ESTATE_INVESTMENT'
  | 'TRADE_FINANCE'
  | 'SECONDARY_TRANSACTION';

// ─── Participant Role ──────────────────────────────────────────────────────────

export type ParticipantRole =
  | 'SPONSOR'
  | 'BORROWER'
  | 'SELLER'
  | 'BUYER'
  | 'LENDER'
  | 'INVESTOR'
  | 'GUARANTOR'
  | 'ADVISOR'
  | 'LEGAL_COUNSEL'
  | 'ADMINISTRATOR';

export type ParticipantStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

// ─── Capital Tranche ──────────────────────────────────────────────────────────

export type CapitalTrancheType =
  | 'SENIOR_DEBT'
  | 'MEZZANINE_DEBT'
  | 'JUNIOR_DEBT'
  | 'PREFERRED_EQUITY'
  | 'COMMON_EQUITY'
  | 'CONVERTIBLE_INSTRUMENT'
  | 'REVENUE_PARTICIPATION'
  | 'HYBRID_INSTRUMENT';

export type InterestRateType = 'FIXED' | 'FLOATING';

export type CouponFrequency =
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMI_ANNUAL'
  | 'ANNUAL'
  | 'AT_MATURITY';

export type AmortizationType = 'BULLET' | 'AMORTIZING' | 'INTEREST_ONLY' | 'PIK';

export type TrancheEconomics = {
  interestRateType: InterestRateType;
  fixedRate: Percentage | null; // percentage, e.g. 8.5
  floatingReferenceRate: string | null; // e.g. 'SOFR', 'EURIBOR'
  spread: Percentage | null; // percentage spread over reference rate
  couponFrequency: CouponFrequency;
  maturityDate: string | null; // ISO date
  gracePeriodMonths: number;
  amortizationType: AmortizationType;
  defaultInterestRate: Percentage | null;
  pikAllowed: boolean;
};

export type CapitalTranche = {
  trancheId: string;
  name: string;
  type: CapitalTrancheType;
  currency: string;
  targetAmount: Money;
  committedAmount: Money | null;
  fundedAmount: Money | null;
  seniority: number;
  ranking: number;
  economics: TrancheEconomics;
};

// Legacy tranche type kept for backward-compat during migration
export type LegacyCapitalTranche = {
  trancheType:
    | 'senior'
    | 'mezzanine'
    | 'juniorDebt'
    | 'preferredEquity'
    | 'commonEquity';
  amount: Money;
  coupon: number;
  seniority: number;
};

export type CapitalStack = {
  tranches: CapitalTranche[];
};

// ─── Governance Terms ─────────────────────────────────────────────────────────

export type GovernanceTerms = {
  boardSeats: number;
  votingThreshold: number; // percentage
  investorVetoRights: string[];
  observerRights: boolean;
  reservedMatters: string[];
  consentRights: string[];
  informationRights: string[];
};

// ─── Economic Rights ──────────────────────────────────────────────────────────

export type EconomicRights = {
  dividendPolicy: string;
  preferredReturn: number;
  carryPercentage: number;
  hurdleRate: number;
  // Extended fields
  coupon: number | null;
  preferredReturnRate: number | null;
  profitSharingPercentage: number | null;
  revenueSharePercentage: number | null;
  distributionFrequency: CouponFrequency | null;
  maturityDate: string | null;
  redemptionTerms: string | null;
};

// ─── Transfer Restrictions ────────────────────────────────────────────────────

export type TransferRestriction = {
  restrictionType: string;
  description: string;
  jurisdiction: string;
  lockUpMonths: number | null;
  requiresApproval: boolean;
  rightOfFirstRefusal: boolean;
  tagAlong: boolean;
  dragAlong: boolean;
  investorEligibilityRequired: boolean;
};

// ─── Vesting Schedule ─────────────────────────────────────────────────────────

export type VestingSchedule = {
  cliffMonths: number;
  vestingMonths: number;
  milestones: string[];
};

// ─── Closing Condition ────────────────────────────────────────────────────────

export type ClosingConditionStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'MET'
  | 'WAIVED'
  | 'FAILED'
  | 'EXPIRED';

export type ClosingConditionCategory =
  | 'LEGAL'
  | 'REGULATORY'
  | 'FINANCIAL'
  | 'TAX'
  | 'TECHNICAL'
  | 'COMMERCIAL'
  | 'OPERATIONAL'
  | 'INVESTOR'
  | 'DOCUMENTATION';

export type ConditionEvidence = {
  documentReference: string | null;
  uploadReference: string | null;
  reviewer: string | null;
  verificationDate: string | null;
  rejectionReason: string | null;
  waiverApprovedBy: string | null;
};

export type ClosingCondition = {
  conditionType: string;
  description: string;
  category: ClosingConditionCategory;
  responsibleParty: string | null;
  dueDate: string | null;
  status: ClosingConditionStatus;
  evidence: ConditionEvidence | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  // legacy field kept for compat
  metAt: string | null;
};

// ─── Deal Metadata ────────────────────────────────────────────────────────────

export type DealPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DealSource = 'INBOUND' | 'OUTBOUND' | 'REFERRAL' | 'PLATFORM' | 'ORIGINATION_OS';

export type DealMetadata = {
  referenceNumber: string;
  internalReference: string | null;
  externalReference: string | null;
  dealType: DealType;
  assetClass: string;
  jurisdiction: string;
  currency: string;
  targetCloseDate: string | null;
  dealOwnerId: string | null;
  dealTeamIds: string[];
  tags: string[];
  source: DealSource;
  priority: DealPriority;
};

// ─── Deal Economics ───────────────────────────────────────────────────────────

export type DealEconomicsData = {
  acquisitionPrice: Money | null;
  enterpriseValue: Money | null;
  equityValue: Money | null;
  totalCapitalization: Money | null;
  fees: Money | null;
  expenses: Money | null;
  targetIrr: Percentage | null; // percentage, e.g. 8.5%
  targetMoic: string | null; // multiple as string to avoid floating point
  expectedYield: Percentage | null; // percentage
};

// ─── Cash Flow ────────────────────────────────────────────────────────────────

export type CashFlowFrequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export type CashFlowPeriod = {
  periodLabel: string; // e.g. '2025-Q1'
  operatingIncome: Money;
  expenses: Money;
  debtService: Money;
  taxes: Money;
  netDistributableIncome: Money;
};

// ─── Waterfall ────────────────────────────────────────────────────────────────

export type WaterfallDistributionType =
  | 'OPERATING_EXPENSES'
  | 'SENIOR_DEBT'
  | 'PREFERRED_RETURN'
  | 'CATCH_UP'
  | 'PROMOTE'
  | 'RESIDUAL';

export type WaterfallTierData = {
  priority: number;
  recipient: string;
  distributionType: WaterfallDistributionType;
  thresholdAmount: Money | null;
  hurdleRate: number | null; // percentage
  allocationPercentage: number; // percentage
  catchUpApplies: boolean;
  catchUpPercentage: number | null;
};

// ─── Approval Reference ───────────────────────────────────────────────────────

export type ApprovalStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'CONDITIONALLY_APPROVED'
  | 'APPROVED'
  | 'REJECTED';

export type ApprovalReference = {
  workflowId: string;
  requestedBy: string;
  requestedAt: string;
  status: ApprovalStatus;
  decidedBy: string | null;
  decidedAt: string | null;
  conditions: string[];
  rejectionReason: string | null;
};

// ─── Document Reference ───────────────────────────────────────────────────────

export type DealDocumentCategory =
  | 'TERM_SHEET'
  | 'FINANCIAL_MODEL'
  | 'INVESTMENT_MEMO'
  | 'LEGAL_DOCUMENT'
  | 'DUE_DILIGENCE'
  | 'CLOSING_DOCUMENT'
  | 'SUPPORTING';

export type DocumentLifecycleStatus =
  | 'DRAFT'
  | 'REVIEW'
  | 'APPROVED'
  | 'SUPERSEDED'
  | 'ARCHIVED';

export type DealDocumentReference = {
  documentId: string;
  externalStorageRef: string;
  category: DealDocumentCategory;
  title: string;
  status: DocumentLifecycleStatus;
  uploadedBy: string;
  uploadedAt: string;
};

// ─── External References ──────────────────────────────────────────────────────

export type AssetReference = {
  assetId: string;
  assetName: string | null;
  assetClass: string | null;
  linkedAt: string;
};

export type EntityRole =
  | 'SPONSOR'
  | 'BORROWER'
  | 'ISSUER'
  | 'SPV'
  | 'COUNTERPARTY';

export type DealEntityReference = {
  entityId: string;
  entityName: string | null;
  role: EntityRole;
  linkedAt: string;
};

export type OpportunityReference = {
  opportunityId: string;
  approvedAt: string | null;
};
