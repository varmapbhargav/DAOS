import { Decimal } from './decimal.vo';

export type Assumption = {
  id: string;
  code: string;
  name: string;
  value: Decimal;
  unit: string;
  currency: string;
  period: string;
  source: string;
  sourceDate: Date;
  confidence: Decimal;
  scenarioId: string;
  min?: Decimal;
  max?: Decimal;
  distribution?: 'normal' | 'lognormal' | 'uniform' | 'triangular' | 'beta' | 'custom';
  overridden: boolean;
  overrideReason?: string;
  version: number;
};

export type AcquisitionAssumptions = {
  purchasePrice: Assumption;
  acquisitionCosts: Assumption;
  closingCosts: Assumption;
  initialCapex: Assumption;
};

export type FinancingAssumptions = {
  loanAmount: Assumption;
  interestRate: Assumption;
  loanTermMonths: Assumption;
  amortizationMonths: Assumption;
  ltv: Assumption;
  originationFee: Assumption;
};

export type OperatingAssumptions = {
  revenueGrowthRate: Assumption;
  occupancyRate: Assumption;
  operatingExpenseRatio: Assumption;
  maintenanceCapexPerUnit: Assumption;
  inflationRate: Assumption;
};

export type RevenueAssumptions = {
  streams: RevenueStreamAssumption[];
};

export type RevenueStreamAssumption = {
  id: string;
  type: 'rental' | 'interest' | 'subscription' | 'transaction_fee' | 'royalty' | 'energy' | 'service' | 'other';
  name: string;
  volume: Assumption;
  unit: Assumption;
  price: Assumption;
  growthRate: Assumption;
  escalationRate: Assumption;
  occupancyRate: Assumption;
  utilizationRate: Assumption;
  seasonalityFactor: Assumption;
  startDate: Assumption;
  endDate: Assumption;
};

export type ExpenseAssumptions = {
  lines: ExpenseLineAssumption[];
};

export type ExpenseLineAssumption = {
  id: string;
  category: string;
  fixedVariable: 'fixed' | 'variable' | 'semi_variable';
  amount: Assumption;
  percentageOfRevenue?: Assumption;
  growthRate: Assumption;
  inflationRate: Assumption;
  perUnit: Assumption;
  period: Assumption;
};

export type ExitAssumptions = {
  exitDate: Assumption;
  exitValuationMethod: Assumption;
  exitMultiple: Assumption;
  exitCapRate: Assumption;
  exitCosts: Assumption;
};

export type RiskAssumptions = {
  marketVolatility: Assumption;
  assetVolatility: Assumption;
  correlationMatrix: Assumption;
};

export type AssumptionSet = {
  acquisition: AcquisitionAssumptions;
  financing: FinancingAssumptions;
  operating: OperatingAssumptions;
  revenue: RevenueAssumptions;
  expense: ExpenseAssumptions;
  exit: ExitAssumptions;
  risk: RiskAssumptions;
};