import { TargetReturnProfile } from '@daos/shared-kernel';

import { OpportunityScoringEngine } from '../../src/domain/services/opportunity-scoring-engine';

const engine = new OpportunityScoringEngine();

describe('OpportunityScoringEngine', () => {
  it('combines weighted components into an overall 0-100 score', () => {
    const result = engine.score({
      targetIrrPercent: 25,
      downsideRiskPercent: 10,
      pPositivePercent: 70,
      structureComplexity: 1,
    });
    // irr=100, risk=80, upside=70, complexity=80 -> 100*.4 + 80*.3 + 70*.2 + 80*.1 = 86
    expect(result.overall).toBe(86);
    expect(result.components.irr).toBe(100);
    expect(result.components.risk).toBe(80);
    expect(result.components.upside).toBe(70);
    expect(result.components.complexity).toBe(80);
  });

  it('clamps every component to the 0-100 range', () => {
    const result = engine.score({
      targetIrrPercent: 100,
      downsideRiskPercent: 60,
      pPositivePercent: 120,
      structureComplexity: 10,
    });
    expect(result.components.irr).toBe(100);
    expect(result.components.risk).toBe(0);
    expect(result.components.upside).toBe(100);
    expect(result.components.complexity).toBe(0);
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
  });

  it('scores from a target return profile using a default complexity', () => {
    const profile: TargetReturnProfile = {
      targetIrrPercent: 20,
      targetMultiple: 1.8,
      expectedHoldPeriodMonths: 60,
      upsidePotentialPercent: 25,
      downsideRiskPercent: 15,
    };
    const result = engine.scoreFromProfile(profile, 65);
    // irr = (20/25)*100 = 80, risk = 100-30 = 70, upside = 65, complexity = 100-40 = 60
    // -> 80*.4 + 70*.3 + 65*.2 + 60*.1 = 32 + 21 + 13 + 6 = 72
    expect(result.overall).toBe(72);
    expect(result.components.complexity).toBe(60);
  });
});
