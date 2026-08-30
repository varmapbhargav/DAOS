import { Injectable } from '@nestjs/common';

export type TaxProfile = {
  treaty?: boolean;
  fatcaExempt?: boolean;
  crsReported?: boolean;
};

@Injectable()
export class TaxWithholdingCalculator {
  withholdingRate(profile: TaxProfile): number {
    if (profile.fatcaExempt) return 0;
    if (profile.treaty) return 15;
    return 30;
  }

  withhold(grossAmount: bigint, profile: TaxProfile): bigint {
    const rate = this.withholdingRate(profile);
    if (rate === 0) return 0n;
    return (grossAmount * BigInt(rate) + 50n) / 100n;
  }
}
