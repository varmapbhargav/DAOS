// Opportunity Engineering ports
export interface OpportunityRepository {
  save(opportunity: Opportunity): Promise<void>;
  findById(id: string): Promise<Opportunity | null>;
  listByTenant(tenantId: string): Promise<Opportunity[]>;
}

export interface ScenarioModelRepository {
  save(scenario: ScenarioModel): Promise<void>;
  findById(id: string): Promise<ScenarioModel | null>;
  findByOpportunityId(opportunityId: string): Promise<ScenarioModel[]>;
}

export interface MonteCarloSimulationService {
  run(
    cashFlowProjections: Record<string, unknown>[],
    iterations: number,
    variables: Record<string, { distribution: string; mean: number; std: number }>,
  ): {
    p10: number;
    p50: number;
    p90: number;
    mean: number;
    std: number;
  };
}

export interface OpportunityScoringEngine {
  calculate(opportunity: Opportunity, scenarios: ScenarioModel[]): OpportunityScore;
}
