// Risk Management ports
export interface RiskAssessmentRepository {
  save(assessment: RiskAssessment): Promise<void>;
  findById(id: string): Promise<RiskAssessment | null>;
  listByProductId(productId: string, limit?: number): Promise<RiskAssessment[]>;
}

export interface RiskLimitRepository {
  save(limit: RiskLimit): Promise<void>;
  findById(id: string): Promise<RiskLimit | null>;
  listByProductId(productId: string): Promise<RiskLimit[]>;
}

export interface StressTestRepository {
  save(test: StressTest): Promise<void>;
  findById(id: string): Promise<StressTest | null>;
  listByProductId(productId: string, limit?: number): Promise<StressTest[]>;
}

export interface StressTestEngine {
  run(scenario: StressTestScenario, exposures: Exposure[]): StressTestResult[];
}

export interface RiskExposureCalculator {
  calculate(productId: string): {
    exposures: Exposure[];
    concentrationBreaches: ConcentrationBreach[];
  };
}

export type StressTestScenario = {
  name: string;
  parameters: Record<string, number>;
};
