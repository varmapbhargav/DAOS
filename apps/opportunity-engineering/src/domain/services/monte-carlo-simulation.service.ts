import { SensitivityFactor } from '@daos/shared-kernel';

export type SimulationResult = {
  expectedIrrPercent: number;
  p10IrrPercent: number;
  p50IrrPercent: number;
  p90IrrPercent: number;
  probabilityPositivePercent: number;
  iterations: number;
};

/**
 * Runs a Monte Carlo simulation over the given sensitivity factors to
 * estimate the distribution of IRR outcomes. A simple pseudo-random walk is
 * used so results are deterministic given a base value and percentile shifts.
 */
export class MonteCarloSimulationService {
  simulate(
    baseIrrPercent: number,
    factors: SensitivityFactor[],
    iterations = 2000,
  ): SimulationResult {
    if (iterations <= 0) throw new Error('Iterations must be positive');

    const samples: number[] = [];
    for (let i = 0; i < iterations; i += 1) {
      let irr = baseIrrPercent;
      for (const f of factors) {
        const shift = f.p90 - f.baseValue;
        const noise = (Math.sin(i * 13.7 + f.name.length * 7.3) + 1) / 2;
        irr += shift * (noise - 0.5);
      }
      samples.push(irr);
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const p = (q: number): number => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const positive = samples.filter((s) => s > 0).length / samples.length;

    return {
      expectedIrrPercent: round(mean),
      p10IrrPercent: round(p(0.1)),
      p50IrrPercent: round(p(0.5)),
      p90IrrPercent: round(p(0.9)),
      probabilityPositivePercent: round(positive * 100),
      iterations,
    };
  }
}

function round(v: number): number {
  return Math.round(v * 100) / 100;
}
