import { ValuationEnginePort, ValuationInput, ValuationResult } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

/**
 * Stub valuation engine adapter. Computes a simple discounted present value
 * of the trailing observed cash flows so the application layer can be
 * exercised without a real quantitative engine. Replace behind the
 * ValuationEnginePort with a real model server in production.
 */
@Injectable()
export class StubValuationAdapter implements ValuationEnginePort {
  async value(input: ValuationInput): Promise<ValuationResult> {
    const rate = input.discountRatePercent / 100;
    let pv = 0;
    for (const cf of input.cashFlows) {
      const denom = Math.pow(1 + rate, cf.period);
      pv += Number(cf.amount) / denom;
    }
    const fairValueMinorUnits = Math.round(pv);
    const band = Math.round(fairValueMinorUnits * 0.1);
    return {
      fairValueMinorUnits: String(fairValueMinorUnits),
      currency: input.cashFlows[0]?.currency ?? 'USD',
      methodology: input.methodology,
      terminalValueMinorUnits: null,
      confidenceHigh: String(fairValueMinorUnits + band),
      confidenceLow: String(fairValueMinorUnits - band),
    };
  }
}
