// Product Design Value Objects
export type ProductType =
  | 'closedEndFund'
  | 'openEndFund'
  | 'SMA'
  | 'feedFund'
  | 'tokenizedBasket'
  | 'REIT'
  | 'BDC'
  | 'SPV';

export type ProductStrategy = {
  investmentObjective: string;
  assetClasses: string[];
  geographies: string[];
  concentrationLimits: ConcentrationLimit[];
};

export type ConcentrationLimit = {
  type: string;
  threshold: number;
};

export type Benchmark = {
  benchmarkName: string;
  indexRef: string;
};

export type LiquidityTerms = {
  redemptionFrequency: string;
  lockUpMonths: number;
  noticeperiodDays: number;
  gating: number;
};

export type FeeStructure = {
  managementFeeAnnual: number;
  performanceFee: number;
  hurdleRate: number;
  highWaterMark: boolean;
  catchUpPercentage: number;
  catchUpRate: number;
};

export type ProductStatus = 'design' | 'internalReview' | 'complianceApproval' | 'boardApproval' | 'active' | 'closed';

export type InvestmentRestriction = {
  restrictionType: string;
  threshold: number;
  description: string;
};
