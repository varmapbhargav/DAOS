import { Decimal, Percentage } from './decimal.vo';

export type ScoringDimension = 
  | 'return_potential'
  | 'risk_profile'
  | 'asset_quality'
  | 'sponsor_quality'
  | 'liquidity'
  | 'market_opportunity'
  | 'data_quality'
  | 'execution_complexity'
  | 'regulatory_complexity'
  | 'strategic_fit';

export type ScoringWeights = Record<ScoringDimension, Decimal>;

export type DimensionScore = {
  dimension: ScoringDimension;
  score: Decimal; // 0-100
  weight: Decimal;
  weightedScore: Decimal;
  rationale: string;
  evidence: string[];
};

export type OpportunityScore = {
  overall: Decimal;
  dimensions: DimensionScore[];
  scoringModelVersion: string;
  calculatedAt: Date;
  calculatedBy: string;
  metadata: Record<string, unknown>;
};

export type ScoreHistoryEntry = {
  version: number;
  score: OpportunityScore;
  createdAt: Date;
  createdBy: string;
  changeReason: string;
};

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  return_potential: new Decimal(0.25),
  risk_profile: new Decimal(0.20),
  asset_quality: new Decimal(0.15),
  sponsor_quality: new Decimal(0.10),
  liquidity: new Decimal(0.05),
  market_opportunity: new Decimal(0.10),
  data_quality: new Decimal(0.05),
  execution_complexity: new Decimal(0.05),
  regulatory_complexity: new Decimal(0.03),
  strategic_fit: new Decimal(0.02),
};

export type ScoringConfig = {
  modelVersion: string;
  weights: ScoringWeights;
  dimensionCalculators: Record<ScoringDimension, (data: any) => Decimal>;
};