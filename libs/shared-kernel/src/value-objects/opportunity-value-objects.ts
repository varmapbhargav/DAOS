// Opportunity Engineering Value Objects

export type TargetReturnProfile = {
  targetIrrPercent: number;
  targetMultiple: number;
  expectedHoldPeriodMonths: number;
  upsidePotentialPercent: number;
  downsideRiskPercent: number;
};

export type OpportunityScore = {
  overall: number;
  components: Record<string, number>;
};

export type SensitivityFactor = {
  name: string;
  baseValue: number;
  p10: number;
  p90: number;
};

export type OpportunityStatus =
  | 'engineered'
  | 'scenarioApproved'
  | 'scored'
  | 'approved'
  | 'rejected';

export type ScenarioType =
  | 'base'
  | 'bull'
  | 'bear'
  | 'stress'
  | 'conservative'
  | 'aggressive';
