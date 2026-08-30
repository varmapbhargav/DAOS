import { FeeStructure, Money } from '@daos/shared-kernel';

export type FeeProjection = {
  managementFee: Money;
  performanceFee: Money;
  carriedInterest: Money;
  netToInvestor: Money;
};

/**
 * Computes a deterministic fee projection for a given gross amount and fee
 * structure. All fee components are rounded down to integer minor units.
 */
export class FeeModelCalculator {
  calculate(grossAmount: Money, feeStructure: FeeStructure): FeeProjection {
    if (grossAmount.amount < 0n) throw new Error('Gross amount cannot be negative');
    if (feeStructure.managementFeeAnnual < 0) throw new Error('Management fee cannot be negative');
    if (feeStructure.performanceFee < 0) throw new Error('Performance fee cannot be negative');
    if (feeStructure.catchUpPercentage < 0) throw new Error('Catch-up percentage cannot be negative');

    const currency = grossAmount.currency;
    const gross = grossAmount.amount;

    const managementFeeAmount = percentOf(gross, feeStructure.managementFeeAnnual);
    const performanceFeeAmount = percentOf(gross, feeStructure.performanceFee);
    const carriedInterestAmount = percentOf(gross, feeStructure.catchUpPercentage);

    const netToInvestor = gross - managementFeeAmount - performanceFeeAmount - carriedInterestAmount;
    if (netToInvestor < 0n) throw new Error('Fees exceed gross amount');

    return {
      managementFee: Money.of(managementFeeAmount, currency),
      performanceFee: Money.of(performanceFeeAmount, currency),
      carriedInterest: Money.of(carriedInterestAmount, currency),
      netToInvestor: Money.of(netToInvestor, currency),
    };
  }
}

function percentOf(amount: bigint, percent: number): bigint {
  const scaled = BigInt(Math.round(percent * 100));
  return (amount * scaled) / 100n / 100n;
}
