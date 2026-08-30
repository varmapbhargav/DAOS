export interface TargetReturnProfileDto {
  targetIrrPercent: number;
  targetMultiple: number;
  expectedHoldPeriodMonths: number;
  upsidePotentialPercent: number;
  downsideRiskPercent: number;
}

export interface SensitivityFactorDto {
  name: string;
  baseValue: number;
  p10: number;
  p90: number;
}

export interface OpportunityScoreDto {
  overall: number;
  components: Record<string, number>;
}

export interface OpportunityDto {
  id: string;
  tenantId: string;
  assetId: string;
  name: string;
  status: string;
  sponsorId: string;
  targetReturn: TargetReturnProfileDto | null;
  score: OpportunityScoreDto | null;
  sensitivityFactors: SensitivityFactorDto[];
  modeledScenarioCount: number;
  approvedScenarioId: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioModelDto {
  id: string;
  tenantId: string;
  opportunityId: string;
  name: string;
  scenarioType: string;
  status: string;
  keyAssumptions: Record<string, number>;
  projectedIrrPercent: number | null;
  projectedMultiple: number | null;
  createdAt: string;
}
