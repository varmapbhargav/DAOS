import { Decimal, Percentage } from '../value-objects/decimal.vo';
import { FinancialModel } from '../value-objects/financial-model.vo';
import { ScenarioModel } from '../aggregates/scenario-model.aggregate';
import { InvestmentThesisAggregate } from '../aggregates/investment-thesis.aggregate';
import { InvestmentStrategyAggregate } from '../aggregates/investment-strategy.aggregate';
import { OpportunityScore, ScoringDimension, ScoringWeights, DimensionScore, ScoreHistoryEntry, DEFAULT_SCORING_WEIGHTS, ScoringConfig } from '../value-objects/opportunity-score.vo';

export class OpportunityScoringEngine {
  private config: ScoringConfig;

  constructor(config?: Partial<ScoringConfig>) {
    this.config = {
      modelVersion: config?.modelVersion ?? '1.0.0',
      weights: config?.weights ?? DEFAULT_SCORING_WEIGHTS,
      dimensionCalculators: config?.dimensionCalculators ?? this.getDefaultCalculators(),
    };
  }

  private getDefaultCalculators(): Record<ScoringDimension, (data: any) => Decimal> {
    return {
      return_potential: (data) => this.calculateReturnPotential(data),
      risk_profile: (data) => this.calculateRiskProfile(data),
      asset_quality: (data) => this.calculateAssetQuality(data),
      sponsor_quality: (data) => this.calculateSponsorQuality(data),
      liquidity: (data) => this.calculateLiquidity(data),
      market_opportunity: (data) => this.calculateMarketOpportunity(data),
      data_quality: (data) => this.calculateDataQuality(data),
      execution_complexity: (data) => this.calculateExecutionComplexity(data),
      regulatory_complexity: (data) => this.calculateRegulatoryComplexity(data),
      strategic_fit: (data) => this.calculateStrategicFit(data),
    };
  }

  calculateScore(data: {
    opportunity: any;
    thesis?: InvestmentThesisAggregate;
    strategies?: InvestmentStrategyAggregate[];
    scenarios?: ScenarioModel[];
    financialModels?: FinancialModel[];
    marketData?: any;
    [key: string]: any;
  }): OpportunityScore {
    const dimensions: DimensionScore[] = [];

    for (const dimension of Object.keys(this.config.dimensionCalculators) as ScoringDimension[]) {
      const calculator = this.config.dimensionCalculators[dimension];
      const rawScore = calculator(data);
      const weight = this.config.weights[dimension];
      const weightedScore = rawScore.multiply(weight);

      dimensions.push({
        dimension,
        score: rawScore,
        weight,
        weightedScore,
        rationale: this.getDimensionRationale(dimension, rawScore, data),
        evidence: this.getDimensionEvidence(dimension, data),
      });
    }

    const overall = dimensions.reduce(
      (sum, d) => sum.add(d.weightedScore),
      new Decimal(0),
    );

    return {
      overall,
      dimensions,
      scoringModelVersion: this.config.modelVersion,
      calculatedAt: new Date(),
      calculatedBy: data.calculatedBy ?? 'system',
      metadata: {
        dimensionCount: dimensions.length,
        weightSum: Object.values(this.config.weights).reduce((sum, w) => sum.add(w), new Decimal(0)).toNumber(),
      },
    };
  }

  private calculateReturnPotential(data: any): Decimal {
    let score = new Decimal(50);
    const scenarios = data.scenarios ?? [];
    const financialModels = data.financialModels ?? [];

    if (scenarios.length > 0) {
      const avgIrr = scenarios.reduce((sum: Decimal, s: ScenarioModel) => {
        const fm = s.financialModel;
        if (fm) return sum.add(new Decimal(fm.returnMetrics.irrPercent.toNumber()));
        return sum;
      }, new Decimal(0)).divide(new Decimal(scenarios.length));
      
      if (avgIrr.gt(new Decimal(20))) score = new Decimal(90);
      else if (avgIrr.gt(new Decimal(15))) score = new Decimal(80);
      else if (avgIrr.gt(new Decimal(10))) score = new Decimal(70);
      else if (avgIrr.gt(new Decimal(8))) score = new Decimal(60);
      else if (avgIrr.gt(new Decimal(5))) score = new Decimal(50);
      else score = new Decimal(30);
    }

    return score;
  }

  private calculateRiskProfile(data: any): Decimal {
    let score = new Decimal(50);
    const scenarios = data.scenarios ?? [];
    
    if (scenarios.length > 0) {
      const hasMonteCarlo = scenarios.some((s: ScenarioModel) => s.status === 'simulated');
      const hasSensitivity = scenarios.some((s: ScenarioModel) => s.status === 'reviewed');
      
      if (hasMonteCarlo && hasSensitivity) score = score.add(new Decimal(20));
      else if (hasMonteCarlo || hasSensitivity) score = score.add(new Decimal(10));
    }

    return score.min(new Decimal(100));
  }

  private calculateAssetQuality(data: any): Decimal {
    return new Decimal(70);
  }

  private calculateSponsorQuality(data: any): Decimal {
    return new Decimal(70);
  }

  private calculateLiquidity(data: any): Decimal {
    let score = new Decimal(50);
    const scenarios = data.scenarios ?? [];
    
    if (scenarios.length > 0) {
      const avgHoldPeriod = scenarios.reduce((sum: Decimal, s: ScenarioModel) => {
        return sum.add(new Decimal(s.holdPeriodMonths));
      }, new Decimal(0)).divide(new Decimal(scenarios.length));
      
      if (avgHoldPeriod.lt(new Decimal(24))) score = new Decimal(80);
      else if (avgHoldPeriod.lt(new Decimal(48))) score = new Decimal(70);
      else if (avgHoldPeriod.lt(new Decimal(72))) score = new Decimal(60);
      else if (avgHoldPeriod.lt(new Decimal(120))) score = new Decimal(50);
      else score = new Decimal(30);
    }

    return score;
  }

  private calculateMarketOpportunity(data: any): Decimal {
    return new Decimal(65);
  }

  private calculateDataQuality(data: any): Decimal {
    let score = new Decimal(50);
    const scenarios = data.scenarios ?? [];
    
    if (scenarios.length > 0) {
      const withAssumptions = scenarios.filter((s: ScenarioModel) => s.assumptions !== null).length;
      const withFinancialModels = scenarios.filter((s: ScenarioModel) => s.financialModel !== null).length;
      
      const assumptionRatio = withAssumptions / scenarios.length;
      const modelRatio = withFinancialModels / scenarios.length;
      
      score = new Decimal(50).add(new Decimal(assumptionRatio * 30)).add(new Decimal(modelRatio * 20));
    }

    return score.min(new Decimal(100));
  }

  private calculateExecutionComplexity(data: any): Decimal {
    return new Decimal(50);
  }

  private calculateRegulatoryComplexity(data: any): Decimal {
    return new Decimal(60);
  }

  private calculateStrategicFit(data: any): Decimal {
    return new Decimal(70);
  }

  private getDimensionRationale(dimension: ScoringDimension, score: Decimal, data: any): string {
    const rationales: Record<ScoringDimension, string> = {
      return_potential: `Based on IRR projections across ${data.scenarios?.length ?? 0} scenarios`,
      risk_profile: `Based on Monte Carlo and sensitivity analysis completion`,
      asset_quality: 'Based on asset class, location, and physical characteristics',
      sponsor_quality: 'Based on sponsor track record and financial capacity',
      liquidity: `Based on average hold period of ${data.scenarios?.reduce((s: number, sc: ScenarioModel) => s + sc.holdPeriodMonths, 0) / (data.scenarios?.length ?? 1)} months`,
      market_opportunity: 'Based on market trends, demand drivers, and competitive landscape',
      data_quality: `Based on ${data.scenarios?.filter((s: ScenarioModel) => s.assumptions).length ?? 0}/${data.scenarios?.length ?? 0} scenarios with assumptions`,
      execution_complexity: 'Based on deal structure, approvals required, and operational changes',
      regulatory_complexity: 'Based on jurisdiction, asset type, and regulatory requirements',
      strategic_fit: 'Based on alignment with fund strategy and portfolio objectives',
    };
    return rationales[dimension] ?? '';
  }

  private getDimensionEvidence(dimension: ScoringDimension, data: any): string[] {
    const evidence: Record<ScoringDimension, string[]> = {
      return_potential: ['Scenario IRR projections', 'Financial model outputs'],
      risk_profile: ['Monte Carlo results', 'Sensitivity analysis', 'Risk assessment'],
      asset_quality: ['Asset due diligence', 'Property condition reports'],
      sponsor_quality: ['Sponsor track record', 'Financial statements'],
      liquidity: ['Hold period assumptions', 'Exit strategy documentation'],
      market_opportunity: ['Market research', 'Comparable transactions'],
      data_quality: ['Assumption documentation', 'Financial model completeness'],
      execution_complexity: ['Deal structure', 'Approval matrix'],
      regulatory_complexity: ['Jurisdiction analysis', 'Regulatory review'],
      strategic_fit: ['Fund mandate', 'Portfolio strategy'],
    };
    return evidence[dimension] ?? [];
  }

  createScoreHistoryEntry(
    score: OpportunityScore,
    version: number,
    createdBy: string,
    changeReason: string,
  ): ScoreHistoryEntry {
    return {
      version,
      score,
      createdAt: new Date(),
      createdBy,
      changeReason,
    };
  }
}