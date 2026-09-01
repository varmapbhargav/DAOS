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

export interface EngineeringReadinessDto {
  assetReady: boolean;
  thesisReady: boolean;
  strategyReady: boolean;
  financialModelReady: boolean;
  valuationReady: boolean;
  scenariosReady: boolean;
  sensitivityReady: boolean;
  monteCarloReady: boolean;
  riskReady: boolean;
  capitalReady: boolean;
  optimizationReady: boolean;
  recommendationReady: boolean;
  overall: 'ready' | 'not_ready' | 'warning';
}

export interface SubWorkflowStatusDto {
  engineering: string;
  scenario: string;
  financialModel: string;
  risk: string;
  optimization: string;
  review: string;
  approval: string;
  handoff: string;
}

export interface OpportunityDto {
  id: string;
  tenantId: string;
  assetId: string;
  name: string;
  description: string | null;
  status: string;
  subStatus: SubWorkflowStatusDto;
  sponsorId: string;
  targetReturn: TargetReturnProfileDto | null;
  score: OpportunityScoreDto | null;
  sensitivityFactors: SensitivityFactorDto[];
  modeledScenarioCount: number;
  selectedScenarioId: string | null;
  readiness: EngineeringReadinessDto;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioModelDto {
  id: string;
  tenantId: string;
  opportunityId: string;
  strategyId: string | null;
  name: string;
  scenarioType: string;
  status: string;
  assumptions: Record<string, unknown> | null;
  financialModel: Record<string, unknown> | null;
  projectedIrrPercent: number | null;
  projectedMultiple: number | null;
  holdPeriodMonths: number;
  isSelected: boolean;
  version: number;
  versions: ScenarioVersionDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioVersionDto {
  version: number;
  name: string;
  scenarioType: string;
  status: string;
  assumptions: Record<string, unknown> | null;
  financialModel: Record<string, unknown> | null;
  holdPeriodMonths: number;
  isSelected: boolean;
  createdAt: Date;
  createdBy: string;
  changeReason: string;
}