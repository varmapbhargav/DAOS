import { Decimal, Percentage } from './decimal.vo';

export type StrategyType = 
  | 'buy_and_hold'
  | 'value_add'
  | 'development'
  | 'redevelopment'
  | 'turnaround'
  | 'income'
  | 'growth'
  | 'refinancing'
  | 'arbitrage'
  | 'structured_financing';

export type StrategyStatus = 'draft' | 'active' | 'selected' | 'rejected' | 'archived';

export type StrategyConstraint = {
  id: string;
  type: 'max_leverage' | 'min_irr' | 'min_moic' | 'max_hold_period' | 'max_downside' | 
        'min_liquidity' | 'jurisdiction_restriction' | 'investment_amount' | 'risk_tolerance';
  name: string;
  value: Decimal;
  unit: string;
  description: string;
};

export type StrategyEntry = {
  approach: string;
  targetPrice: Decimal;
  timing: string;
  conditions: string[];
};

export type StrategyOperating = {
  valueCreationPlan: string;
  operationalImprovements: string[];
  managementChanges: string[];
  capexPlan: Decimal;
};

export type StrategyFinancing = {
  structure: string;
  leverageTarget: Percentage;
  debtType: string;
  equityStructure: string;
  preferredReturn: Percentage;
};

export type StrategyValueCreation = {
  drivers: string[];
  expectedUplift: Percentage;
  timelineMonths: number;
  investmentRequired: Decimal;
};

export type StrategyExit = {
  type: 'sale' | 'refinancing' | 'ipo' | 'secondary_sale' | 'recapitalization';
  targetTiming: string;
  targetMultiple: Decimal;
  conditions: string[];
};

export type InvestmentStrategy = {
  id: string;
  opportunityId: string;
  name: string;
  strategyType: StrategyType;
  description: string;
  status: StrategyStatus;
  entry: StrategyEntry;
  operating: StrategyOperating;
  financing: StrategyFinancing;
  valueCreation: StrategyValueCreation;
  exit: StrategyExit;
  investmentHorizonMonths: number;
  constraints: StrategyConstraint[];
  targetReturns: {
    targetIrr: Percentage;
    targetMoic: Decimal;
    targetCashYield: Percentage;
  };
  riskTolerance: Percentage;
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InvestmentStrategyVersion = {
  version: number;
  name: string;
  strategyType: StrategyType;
  description: string;
  status: StrategyStatus;
  entry: StrategyEntry;
  operating: StrategyOperating;
  financing: StrategyFinancing;
  valueCreation: StrategyValueCreation;
  exit: StrategyExit;
  investmentHorizonMonths: number;
  constraints: StrategyConstraint[];
  targetReturns: {
    targetIrr: Percentage;
    targetMoic: Decimal;
    targetCashYield: Percentage;
  };
  riskTolerance: Percentage;
  createdAt: Date;
  createdBy: string;
  changeReason: string;
};