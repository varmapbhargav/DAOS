import { SensitivityFactor } from '@daos/shared-kernel';
import { AssumptionSet } from '../value-objects/assumption.vo';
import { FinancialModelEngine } from './financial-model-engine';
import { FinancialModel, ReturnMetrics } from '../value-objects/financial-model.vo';
import { Percentage, Decimal } from '../value-objects/decimal.vo';

export type DistributionType = 'normal' | 'lognormal' | 'uniform' | 'triangular' | 'beta' | 'custom';

export type AssumptionDistribution = {
  assumptionCode: string;
  distribution: DistributionType;
  mean: number;
  stdDev?: number;
  min?: number;
  max?: number;
  mode?: number;
  alpha?: number;
  beta?: number;
  customSampler?: () => number;
};

export type MonteCarloConfig = {
  iterations: number;
  distributions: AssumptionDistribution[];
  seed?: number;
};

export type MonteCarloResult = {
  expectedIrr: Percentage;
  medianIrr: Percentage;
  p10Irr: Percentage;
  p50Irr: Percentage;
  p90Irr: Percentage;
  expectedMoic: Decimal;
  probabilityOfLoss: Percentage;
  probabilityOfTargetReturn: Percentage;
  valueAtRisk95: Percentage;
  valueAtRisk99: Percentage;
  iterations: number;
  distribution: number[];
  calculatedAt: Date;
};

export class MonteCarloSimulationService {
  private rng: () => number;

  constructor(seed?: number) {
    this.rng = this.createRNG(seed);
  }

  private createRNG(seed?: number): () => number {
    let state = seed ?? Date.now();
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  private sampleNormal(mean: number, stdDev: number): number {
    const u1 = this.rng();
    const u2 = this.rng();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * stdDev;
  }

  private sampleLognormal(mean: number, stdDev: number): number {
    const normal = this.sampleNormal(mean, stdDev);
    return Math.exp(normal);
  }

  private sampleUniform(min: number | undefined, max: number | undefined): number {
    const actualMin = min !== undefined ? min : 0;
    const actualMax = max !== undefined ? max : 1;
    return actualMin + this.rng() * (actualMax - actualMin);
  }

  private sampleTriangular(min: number | undefined, max: number | undefined, mode: number | undefined): number {
    const actualMin = min !== undefined ? min : 0;
    const actualMax = max !== undefined ? max : 1;
    const actualMode = mode !== undefined ? mode : (actualMin + actualMax) / 2;
    const u = this.rng();
    const c = (actualMode - actualMin) / (actualMax - actualMin);
    if (u < c) {
      return actualMin + Math.sqrt(u * (actualMax - actualMin) * (actualMode - actualMin));
    } else {
      return actualMax - Math.sqrt((1 - u) * (actualMax - actualMin) * (actualMax - actualMode));
    }
  }

  private sampleBeta(alpha: number, beta: number): number {
    const gammaAlpha = this.sampleGamma(alpha, 1);
    const gammaBeta = this.sampleGamma(beta, 1);
    return gammaAlpha / (gammaAlpha + gammaBeta);
  }

  private sampleGamma(shape: number, scale: number): number {
    if (shape < 1) {
      return this.sampleGamma(shape + 1, scale) * Math.pow(this.rng(), 1 / shape);
    }
    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    while (true) {
      let x;
      let v;
      do {
        x = this.sampleNormal(0, 1);
        v = 1 + c * x;
      } while (v <= 0);
      v = v * v * v;
      const u = this.rng();
      if (u < 1 - 0.0331 * x * x * x * x) return d * v * scale;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v * scale;
    }
  }

  private sampleFromDistribution(dist: AssumptionDistribution): number {
    switch (dist.distribution) {
      case 'normal':
        return this.sampleNormal(dist.mean, dist.stdDev ?? 0);
      case 'lognormal':
        return this.sampleLognormal(dist.mean, dist.stdDev ?? 0);
      case 'uniform':
        return this.sampleUniform(dist.min, dist.max);
      case 'triangular':
        return this.sampleTriangular(dist.min, dist.max, dist.mode);
      case 'beta':
        return this.sampleBeta(dist.alpha ?? 1, dist.beta ?? 1);
      case 'custom':
        return dist.customSampler ? dist.customSampler() : dist.mean;
      default:
        return dist.mean;
    }
  }

  private applySampledAssumptions(baseAssumptions: AssumptionSet, samples: Map<string, number>): AssumptionSet {
    const cloned = JSON.parse(JSON.stringify(baseAssumptions)) as AssumptionSet;

    const applySample = (assumption: any, code: string): any => {
      const sampledValue = samples.get(code);
      if (sampledValue !== undefined) {
        return { ...assumption, value: new Decimal(sampledValue) };
      }
      return assumption;
    };

    cloned.acquisition = {
      purchasePrice: applySample(cloned.acquisition.purchasePrice, 'purchasePrice'),
      acquisitionCosts: applySample(cloned.acquisition.acquisitionCosts, 'acquisitionCosts'),
      closingCosts: applySample(cloned.acquisition.closingCosts, 'closingCosts'),
      initialCapex: applySample(cloned.acquisition.initialCapex, 'initialCapex'),
    };

    cloned.financing = {
      loanAmount: applySample(cloned.financing.loanAmount, 'loanAmount'),
      interestRate: applySample(cloned.financing.interestRate, 'interestRate'),
      loanTermMonths: applySample(cloned.financing.loanTermMonths, 'loanTermMonths'),
      amortizationMonths: applySample(cloned.financing.amortizationMonths, 'amortizationMonths'),
      ltv: applySample(cloned.financing.ltv, 'ltv'),
      originationFee: applySample(cloned.financing.originationFee, 'originationFee'),
    };

    cloned.operating = {
      revenueGrowthRate: applySample(cloned.operating.revenueGrowthRate, 'revenueGrowthRate'),
      occupancyRate: applySample(cloned.operating.occupancyRate, 'occupancyRate'),
      operatingExpenseRatio: applySample(cloned.operating.operatingExpenseRatio, 'operatingExpenseRatio'),
      maintenanceCapexPerUnit: applySample(cloned.operating.maintenanceCapexPerUnit, 'maintenanceCapexPerUnit'),
      inflationRate: applySample(cloned.operating.inflationRate, 'inflationRate'),
    };

    cloned.revenue = {
      streams: cloned.revenue.streams.map(stream => ({
        ...stream,
        volume: applySample(stream.volume, `volume_${stream.id}`),
        price: applySample(stream.price, `price_${stream.id}`),
        growthRate: applySample(stream.growthRate, `growthRate_${stream.id}`),
        escalationRate: applySample(stream.escalationRate, `escalationRate_${stream.id}`),
        occupancyRate: applySample(stream.occupancyRate, `occupancyRate_${stream.id}`),
        utilizationRate: applySample(stream.utilizationRate, `utilizationRate_${stream.id}`),
      })),
    };

    cloned.expense = {
      lines: cloned.expense.lines.map(line => ({
        ...line,
        amount: applySample(line.amount, `expense_${line.id}`),
        growthRate: applySample(line.growthRate, `expenseGrowth_${line.id}`),
      })),
    };

    cloned.exit = {
      exitDate: applySample(cloned.exit.exitDate, 'exitDate'),
      exitValuationMethod: applySample(cloned.exit.exitValuationMethod, 'exitValuationMethod'),
      exitMultiple: applySample(cloned.exit.exitMultiple, 'exitMultiple'),
      exitCapRate: applySample(cloned.exit.exitCapRate, 'exitCapRate'),
      exitCosts: applySample(cloned.exit.exitCosts, 'exitCosts'),
    };

    return cloned;
  }

  simulate(
    baseAssumptions: AssumptionSet,
    config: MonteCarloConfig,
    holdPeriodMonths: number,
  ): MonteCarloResult {
    if (config.iterations <= 0) throw new Error('Iterations must be positive');

    const engine = new FinancialModelEngine();
    const irrResults: number[] = [];
    const moicResults: number[] = [];

    for (let i = 0; i < config.iterations; i++) {
      const samples = new Map<string, number>();

      for (const dist of config.distributions) {
        samples.set(dist.assumptionCode, this.sampleFromDistribution(dist));
      }

      const sampledAssumptions = this.applySampledAssumptions(baseAssumptions, samples);
      const result = engine.calculate(sampledAssumptions, holdPeriodMonths, '', '', 'monte-carlo');

      irrResults.push(result.model.returnMetrics.irrPercent.toNumber());
      moicResults.push(result.model.returnMetrics.grossMoic.toNumber());
    }

    const sortedIrr = [...irrResults].sort((a, b) => a - b);
    const sortedMoic = [...moicResults].sort((a, b) => a - b);

    const percentile = (arr: number[], p: number): number => {
      const idx = Math.min(arr.length - 1, Math.floor(p * arr.length));
      return arr[idx];
    };

    const meanIrr = irrResults.reduce((a, b) => a + b, 0) / irrResults.length;
    const medianIrr = percentile(sortedIrr, 0.5);
    const probabilityOfLoss = irrResults.filter(r => r <= 0).length / irrResults.length;
    const targetReturn = 0.08;
    const probabilityOfTarget = irrResults.filter(r => r >= targetReturn).length / irrResults.length;

    const var95 = percentile(sortedIrr, 0.05);
    const var99 = percentile(sortedIrr, 0.01);

    return {
      expectedIrr: Percentage.fromBasisPoints(Math.round(meanIrr * 10000)),
      medianIrr: Percentage.fromBasisPoints(Math.round(medianIrr * 10000)),
      p10Irr: Percentage.fromBasisPoints(Math.round(percentile(sortedIrr, 0.1) * 10000)),
      p50Irr: Percentage.fromBasisPoints(Math.round(percentile(sortedIrr, 0.5) * 10000)),
      p90Irr: Percentage.fromBasisPoints(Math.round(percentile(sortedIrr, 0.9) * 10000)),
      expectedMoic: new Decimal(moicResults.reduce((a, b) => a + b, 0) / moicResults.length),
      probabilityOfLoss: Percentage.fromBasisPoints(Math.round(probabilityOfLoss * 10000)),
      probabilityOfTargetReturn: Percentage.fromBasisPoints(Math.round(probabilityOfTarget * 10000)),
      valueAtRisk95: Percentage.fromBasisPoints(Math.round(var95 * 10000)),
      valueAtRisk99: Percentage.fromBasisPoints(Math.round(var99 * 10000)),
      iterations: config.iterations,
      distribution: sortedIrr,
      calculatedAt: new Date(),
    };
  }
}