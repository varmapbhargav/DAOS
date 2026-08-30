import { RiskProfile } from '@daos/shared-kernel';

import { Investor } from '../aggregates/investor.aggregate';

export type SuitabilityDecision = {
  suitable: boolean;
  reasons: string[];
};

const RISK_MAP: Record<RiskProfile['riskTolerance'], number> = { low: 1, medium: 2, high: 3 };
const LIQUIDITY_MAP: Record<RiskProfile['liquidityNeeds'], number> = { low: 3, medium: 2, high: 1 };

/**
 * Assesses whether an investor is suitable for a given investment based on
 * their declared risk profile, investment horizon and liquidity needs.
 * Private capital vehicles are typically illiquid and long-dated.
 */
export class SuitabilityAssessor {
  assess(investor: Investor, illiquidHorizonMonths: number): SuitabilityDecision {
    const reasons: string[] = [];
    const risk = investor.riskProfile;

    if (!risk) {
      return { suitable: false, reasons: ['Investor has no risk profile on file'] };
    }

    const riskScore = RISK_MAP[risk.riskTolerance];
    const liquidityScore = LIQUIDITY_MAP[risk.liquidityNeeds];

    if (riskScore < 2) {
      reasons.push('Investor risk tolerance is too low for the vehicle');
    }
    if (investmentHorizonMismatch(risk.investmentHorizon, illiquidHorizonMonths)) {
      reasons.push('Investment horizon is shorter than the vehicle lock-up');
    }
    if (liquidityScore <= 1) {
      reasons.push('Investor liquidity needs are too high for an illiquid vehicle');
    }

    return { suitable: reasons.length === 0, reasons };
  }
}

function investmentHorizonMismatch(horizonMonths: number, vehicleMonths: number): boolean {
  return horizonMonths !== 0 && horizonMonths < vehicleMonths;
}
