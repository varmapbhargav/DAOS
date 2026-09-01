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
  | 'draft'
  | 'engineering'
  | 'thesis_defined'
  | 'strategy_design'
  | 'financial_modeling'
  | 'scenario_modeling'
  | 'analysis'
  | 'optimization'
  | 'recommended'
  | 'ready_for_review'
  | 'under_review'
  | 'ready_for_approval'
  | 'approved'
  | 'structuring_ready'
  | 'handed_off'
  | 'on_hold'
  | 'rejected'
  | 'archived'
  | 'superseded';

export type ScenarioType =
  | 'base'
  | 'bull'
  | 'bear'
  | 'stress'
  | 'conservative'
  | 'aggressive';

export type ScenarioStatus =
  | 'not_started'
  | 'modeling'
  | 'calculated'
  | 'simulated'
  | 'reviewed'
  | 'selected'
  | 'rejected'
  | 'archived';

export type EngineeringStatus =
  | 'draft'
  | 'in_progress'
  | 'complete';
