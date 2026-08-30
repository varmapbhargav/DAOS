// Waterfall Engine & Corporate Actions Value Objects
import { Money } from '../index';

export type WaterfallType = 'american' | 'european' | 'hybrid';

export type WaterfallTierType = 'returnOfCapital' | 'preferredReturn' | 'catchUp' | 'carriedInterest' | 'commonEquity';

export type WaterfallTier = {
  tierOrder: number;
  tierType: WaterfallTierType;
  distributionRate: number | null;
  catchUpRate: number | null;
};

export type DistributionType =
  | 'income'
  | 'capitalReturn'
  | 'dividendCash'
  | 'dividendScrip'
  | 'carriedInterest';

export type DistributionStatus = 'declared' | 'calculated' | 'approved' | 'paying' | 'paid' | 'reconciled';

export type InvestorDistribution = {
  investorId: string;
  shareCount: number;
  grossAmount: Money;
  withholdingTax: Money;
  netAmount: Money;
};

export type CorporateActionType =
  | 'stockSplit'
  | 'reverseStockSplit'
  | 'redemption'
  | 'buyback'
  | 'rightsIssue'
  | 'merger'
  | 'spinOff'
  | 'dividendReinvestment';

export type CorporateActionStatus = 'announced' | 'electionOpen' | 'electionClosed' | 'processing' | 'completed' | 'cancelled';

export type InvestorElection = {
  investorId: string;
  electionType: string;
  electionDate: string;
};
