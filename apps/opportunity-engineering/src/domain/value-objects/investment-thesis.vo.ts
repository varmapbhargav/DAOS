import { Decimal, Percentage } from './decimal.vo';

export type ValueCreationDriver = {
  id: string;
  type: 'revenue_growth' | 'cost_reduction' | 'operational_improvement' | 'asset_repositioning' | 
        'leverage_optimization' | 'refinancing' | 'market_appreciation' | 'arbitrage' | 
        'technology_improvement' | 'portfolio_synergies';
  name: string;
  description: string;
  expectedImpact: Decimal;
  probability: Percentage;
  timeHorizonMonths: number;
  dependencies: string[];
};

export type ExitStrategy = {
  type: 'sale' | 'refinancing' | 'ipo' | 'secondary_sale' | 'redemption' | 'maturity' | 'recapitalization';
  targetDate: Date;
  targetValue: Decimal;
  assumptions: Record<string, unknown>;
  probability: Percentage;
};

export type InvestmentThesisStatus = 'draft' | 'final' | 'approved' | 'archived';

export type InvestmentThesis = {
  id: string;
  opportunityId: string;
  thesisStatement: string;
  executiveSummary: string;
  investmentRationale: string;
  marketOpportunity: string;
  assetRationale: string;
  problem: string;
  solution: string;
  competitiveAdvantage: string;
  valueCreationThesis: string;
  keyCatalysts: string[];
  keyRisks: string[];
  riskMitigation: string[];
  investmentHorizonMonths: number;
  entryThesis: string;
  exitStrategy: ExitStrategy;
  expectedReturn: Percentage;
  targetYield: Percentage;
  confidenceScore: Percentage;
  status: InvestmentThesisStatus;
  version: number;
  createdBy: string;
  approvedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InvestmentThesisVersion = {
  version: number;
  thesisStatement: string;
  executiveSummary: string;
  investmentRationale: string;
  marketOpportunity: string;
  assetRationale: string;
  problem: string;
  solution: string;
  competitiveAdvantage: string;
  valueCreationThesis: string;
  keyCatalysts: string[];
  keyRisks: string[];
  riskMitigation: string[];
  investmentHorizonMonths: number;
  entryThesis: string;
  exitStrategy: ExitStrategy;
  expectedReturn: Percentage;
  targetYield: Percentage;
  confidenceScore: Percentage;
  status: InvestmentThesisStatus;
  createdAt: Date;
  createdBy: string;
  changeReason: string;
};