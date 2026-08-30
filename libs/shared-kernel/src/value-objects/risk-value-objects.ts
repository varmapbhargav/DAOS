// Risk Management Value Objects
export type RiskAssessmentType =
  | 'issuer'
  | 'sector'
  | 'geography'
  | 'counterparty'
  | 'liquidity'
  | 'operational';

export type RiskLimitType =
  | 'issuerConcentration'
  | 'sectorConcentration'
  | 'geographyConcentration'
  | 'singlePositionSize'
  | 'liquidityMinimum';

export type RiskRating = 'low' | 'medium' | 'high' | 'critical';

export type Exposure = {
  exposureType: RiskAssessmentType;
  amount: Money;
  percentage: number;
};

export type ConcentrationBreach = {
  limitId: string;
  limitType: RiskLimitType;
  currentValue: number;
  limitValue: number;
};

export type StressTestResult = {
  metric: string;
  baseValue: Money;
  stressedValue: Money;
  impact: number;
};
