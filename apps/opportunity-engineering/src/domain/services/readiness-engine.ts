import { Opportunity, EngineeringReadiness } from '../aggregates/opportunity.aggregate';
import { ScenarioModel } from '../aggregates/scenario-model.aggregate';
import { FinancialModel } from '../value-objects/financial-model.vo';

export type ReadinessCheck = {
  name: string;
  passed: boolean;
  message?: string;
};

export type ReadinessResult = {
  overall: 'ready' | 'not_ready' | 'warning';
  checks: ReadinessCheck[];
  warnings: string[];
  errors: string[];
};

export class ReadinessEngine {
  check(opportunity: Opportunity, scenarios: ScenarioModel[]): ReadinessResult {
    const checks: ReadinessCheck[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    // Asset Ready
    const assetReady = this.checkAsset(opportunity);
    checks.push(assetReady);
    if (!assetReady.passed) errors.push(assetReady.message!);

    // Thesis Ready
    const thesisReady = this.checkThesis(opportunity);
    checks.push(thesisReady);
    if (!thesisReady.passed) errors.push(thesisReady.message!);

    // Strategy Ready
    const strategyReady = this.checkStrategy(opportunity);
    checks.push(strategyReady);
    if (!strategyReady.passed) errors.push(strategyReady.message!);

    // Financial Model Ready
    const financialModelReady = this.checkFinancialModel(opportunity, scenarios);
    checks.push(financialModelReady);
    if (!financialModelReady.passed) errors.push(financialModelReady.message!);

    // Valuation Ready
    const valuationReady = this.checkValuation(opportunity, scenarios);
    checks.push(valuationReady);
    if (!valuationReady.passed) errors.push(valuationReady.message!);

    // Scenarios Ready
    const scenariosReady = this.checkScenarios(opportunity, scenarios);
    checks.push(scenariosReady);
    if (!scenariosReady.passed) errors.push(scenariosReady.message!);

    // Sensitivity Ready
    const sensitivityReady = this.checkSensitivity(opportunity, scenarios);
    checks.push(sensitivityReady);
    if (!sensitivityReady.passed) warnings.push(sensitivityReady.message!);

    // Monte Carlo Ready
    const monteCarloReady = this.checkMonteCarlo(opportunity, scenarios);
    checks.push(monteCarloReady);
    if (!monteCarloReady.passed) warnings.push(monteCarloReady.message!);

    // Risk Ready
    const riskReady = this.checkRisk(opportunity, scenarios);
    checks.push(riskReady);
    if (!riskReady.passed) warnings.push(riskReady.message!);

    // Capital Ready
    const capitalReady = this.checkCapital(opportunity, scenarios);
    checks.push(capitalReady);
    if (!capitalReady.passed) warnings.push(capitalReady.message!);

    // Optimization Ready
    const optimizationReady = this.checkOptimization(opportunity, scenarios);
    checks.push(optimizationReady);
    if (!optimizationReady.passed) warnings.push(optimizationReady.message!);

    // Recommendation Ready
    const recommendationReady = this.checkRecommendation(opportunity);
    checks.push(recommendationReady);
    if (!recommendationReady.passed) errors.push(recommendationReady.message!);

    const passedChecks = checks.filter(c => c.passed).length;
    const totalChecks = checks.length;
    const criticalFailures = checks.filter(c => !c.passed && errors.includes(c.message!)).length;

    let overall: 'ready' | 'not_ready' | 'warning';
    if (criticalFailures > 0) {
      overall = 'not_ready';
    } else if (passedChecks === totalChecks) {
      overall = 'ready';
    } else {
      overall = 'warning';
    }

    return { overall, checks, warnings, errors };
  }

  private checkAsset(opportunity: Opportunity): ReadinessCheck {
    // In a real implementation, this would check against Asset Origination
    return {
      name: 'Asset',
      passed: !!opportunity.assetId,
      message: opportunity.assetId ? undefined : 'Asset reference is missing',
    };
  }

  private checkThesis(opportunity: Opportunity): ReadinessCheck {
    // Would check if InvestmentThesis exists and is finalized
    return {
      name: 'Thesis',
      passed: opportunity.readiness.thesisReady,
      message: opportunity.readiness.thesisReady ? undefined : 'Investment thesis is not finalized',
    };
  }

  private checkStrategy(opportunity: Opportunity): ReadinessCheck {
    return {
      name: 'Strategy',
      passed: opportunity.readiness.strategyReady,
      message: opportunity.readiness.strategyReady ? undefined : 'Investment strategy is not defined',
    };
  }

  private checkFinancialModel(opportunity: Opportunity, scenarios: ScenarioModel[]): ReadinessCheck {
    const calculatedScenarios = scenarios.filter(s => s.status === 'calculated' || s.status === 'simulated' || s.status === 'reviewed' || s.status === 'selected');
    const passed = calculatedScenarios.length > 0 && calculatedScenarios.every(s => s.financialModel !== null);
    return {
      name: 'Financial Model',
      passed,
      message: passed ? undefined : 'At least one scenario must have a calculated financial model',
    };
  }

  private checkValuation(opportunity: Opportunity, scenarios: ScenarioModel[]): ReadinessCheck {
    const calculatedScenarios = scenarios.filter(s => s.financialModel !== null);
    const passed = calculatedScenarios.length > 0;
    return {
      name: 'Valuation',
      passed,
      message: passed ? undefined : 'Valuation must be completed for at least one scenario',
    };
  }

  private checkScenarios(opportunity: Opportunity, scenarios: ScenarioModel[]): ReadinessCheck {
    const passed = scenarios.length > 0 && opportunity.selectedScenarioId !== null;
    return {
      name: 'Scenarios',
      passed,
      message: passed ? undefined : 'At least one scenario must be created and selected',
    };
  }

  private checkSensitivity(opportunity: Opportunity, scenarios: ScenarioModel[]): ReadinessCheck {
    // Would check if sensitivity analysis is complete
    return {
      name: 'Sensitivity',
      passed: opportunity.readiness.sensitivityReady,
      message: opportunity.readiness.sensitivityReady ? undefined : 'Sensitivity analysis not completed',
    };
  }

  private checkMonteCarlo(opportunity: Opportunity, scenarios: ScenarioModel[]): ReadinessCheck {
    return {
      name: 'Monte Carlo',
      passed: opportunity.readiness.monteCarloReady,
      message: opportunity.readiness.monteCarloReady ? undefined : 'Monte Carlo simulation not completed',
    };
  }

  private checkRisk(opportunity: Opportunity, scenarios: ScenarioModel[]): ReadinessCheck {
    return {
      name: 'Risk',
      passed: opportunity.readiness.riskReady,
      message: opportunity.readiness.riskReady ? undefined : 'Risk assessment not completed',
    };
  }

  private checkCapital(opportunity: Opportunity, scenarios: ScenarioModel[]): ReadinessCheck {
    return {
      name: 'Capital',
      passed: opportunity.readiness.capitalReady,
      message: opportunity.readiness.capitalReady ? undefined : 'Capital requirements not calculated',
    };
  }

  private checkOptimization(opportunity: Opportunity, scenarios: ScenarioModel[]): ReadinessCheck {
    return {
      name: 'Optimization',
      passed: opportunity.readiness.optimizationReady,
      message: opportunity.readiness.optimizationReady ? undefined : 'Structure optimization not completed',
    };
  }

  private checkRecommendation(opportunity: Opportunity): ReadinessCheck {
    return {
      name: 'Recommendation',
      passed: opportunity.readiness.recommendationReady && opportunity.selectedScenarioId !== null,
      message: opportunity.readiness.recommendationReady && opportunity.selectedScenarioId !== null
        ? undefined
        : 'Recommendation not generated or no scenario selected',
    };
  }
}