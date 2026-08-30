import { SensitivityFactor } from '@daos/shared-kernel';

import { MonteCarloSimulationService } from '../../src/domain/services/monte-carlo-simulation.service';

const service = new MonteCarloSimulationService();

describe('MonteCarloSimulationService', () => {
  it('returns expected, percentiles and probability of positive return', () => {
    const factors: SensitivityFactor[] = [
      { name: 'exitCap', baseValue: 4.5, p10: 3.5, p90: 6 },
      { name: 'rentGrowth', baseValue: 3, p10: 2, p90: 4 },
    ];
    const result = service.simulate(15, factors, 2000);
    expect(result.iterations).toBe(2000);
    expect(result.p10IrrPercent).toBeLessThanOrEqual(result.p50IrrPercent);
    expect(result.p50IrrPercent).toBeLessThanOrEqual(result.p90IrrPercent);
    expect(result.probabilityPositivePercent).toBeGreaterThan(0);
    expect(result.probabilityPositivePercent).toBeLessThanOrEqual(100);
  });

  it('is deterministic for zero-shift factors around the base IRR', () => {
    const factors: SensitivityFactor[] = [
      { name: 'exitCap', baseValue: 5, p10: 5, p90: 5 },
    ];
    const result = service.simulate(12, factors, 500);
    expect(result.expectedIrrPercent).toBe(12);
    expect(result.p10IrrPercent).toBe(12);
    expect(result.p50IrrPercent).toBe(12);
    expect(result.p90IrrPercent).toBe(12);
    expect(result.probabilityPositivePercent).toBe(100);
  });

  it('rejects non-positive iteration counts', () => {
    expect(() => service.simulate(12, [], 0)).toThrow('Iterations must be positive');
    expect(() => service.simulate(12, [], -5)).toThrow('Iterations must be positive');
  });
});
