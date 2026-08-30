// Pricing & Valuation Value Objects
export type PricingSource = 'marketFeed' | 'vendorApi' | 'modelBased' | 'manual' | 'nav';

export type FairValueHierarchy = 'level1' | 'level2' | 'level3';

export type ValuationModelType =
  | 'DCF'
  | 'comparables'
  | 'NAV'
  | 'costApproach'
  | 'incomeApproach'
  | 'AVM';

export type ReviewStatus = 'pendingCommittee' | 'approved' | 'rejected';
