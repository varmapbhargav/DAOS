import { OpportunityScore, TargetReturnProfile } from '@daos/shared-kernel';

export type ScoringInput = {
  targetIrrPercent: number;
  downsideRiskPercent: number;
  pPositivePercent: number;
  structureComplexity: number; // 0 = simple, higher = more complex
};

/**
 * Scores an engineered opportunity across a set of quantitative dimensions.
 * Each component is weighted onto a 0-100 scale and combined into an overall
 * score used to compare opportunities.
 */
export class OpportunityScoringEngine {
  score(input: ScoringInput): OpportunityScore {
    const irrScore = clamp((input.targetIrrPercent / 25) * 100, 0, 100);
    const riskScore = clamp(100 - input.downsideRiskPercent * 2, 0, 100);
    const upsideScore = clamp(input.pPositivePercent, 0, 100);
    const complexityScore = clamp(100 - input.structureComplexity * 20, 0, 100);

    const overall = Math.round(
      irrScore * 0.4 + riskScore * 0.3 + upsideScore * 0.2 + complexityScore * 0.1,
    );

    return {
      overall,
      components: {
        irr: Math.round(irrScore),
        risk: Math.round(riskScore),
        upside: Math.round(upsideScore),
        complexity: Math.round(complexityScore),
      },
    };
  }

  scoreFromProfile(profile: TargetReturnProfile, pPositivePercent: number): OpportunityScore {
    return this.score({
      targetIrrPercent: profile.targetIrrPercent,
      downsideRiskPercent: profile.downsideRiskPercent,
      pPositivePercent,
      structureComplexity: 2,
    });
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
