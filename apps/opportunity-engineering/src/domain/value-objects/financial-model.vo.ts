import { Money, Decimal, Percentage } from './decimal.vo';

export type CashFlowPeriod = {
  period: number;
  date: Date;
  revenue: Money;
  operatingExpenses: Money;
  ebitda: Money;
  depreciation: Money;
  ebit: Money;
  interest: Money;
  ebt: Money;
  taxes: Money;
  netIncome: Money;
  capex: Money;
  workingCapitalChange: Money;
  freeCashFlow: Money;
  debtDrawdown: Money;
  principalRepayment: Money;
  leveredCashFlow: Money;
  unleveredCashFlow: Money;
};

export type ExitModel = {
  exitDate: Date;
  exitValue: Money;
  netExitProceeds: Money;
  exitMultiple: Decimal;
  exitCapRate: Percentage;
};

export type ReturnMetrics = {
  irrPercent: Percentage;
  xirrPercent: Percentage;
  projectIrrPercent: Percentage;
  equityIrrPercent: Percentage;
  leveredIrrPercent: Percentage;
  unleveredIrrPercent: Percentage;
  grossMoic: Decimal;
  netMoic: Decimal;
  npv: Money;
  cashYield: Percentage;
  cashOnCash: Percentage;
  paybackPeriodMonths: number;
  equityMultiple: Decimal;
  dscr: Decimal;
  debtYield: Percentage;
  ltv: Percentage;
};

export type FinancialModel = {
  periods: CashFlowPeriod[];
  exitModel: ExitModel;
  returnMetrics: ReturnMetrics;
  modelVersion: string;
  calculatedAt: Date;
  assumptionsSnapshot: Record<string, unknown>;
};