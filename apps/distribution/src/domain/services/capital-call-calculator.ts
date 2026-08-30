import { Money, SubscriptionAllocation } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

export type CapitalCallComputation = {
  subscriptionId: string;
  amount: Money;
};

/**
 * Computes the capital call amount for each allocated subscription based on
 * a percentage of the committed/allocated amount.
 */
@Injectable()
export class CapitalCallCalculator {
  calculate(params: { entries: SubscriptionAllocation[]; callPct: number }): CapitalCallComputation[] {
    if (params.callPct <= 0 || params.callPct > 100) throw new Error('Call percentage must be between 0 and 100');
    if (params.entries.length === 0) return [];
    const currency = params.entries[0].requestedAmount.currency;
    return params.entries.map((entry) => {
      const minorUnit = (entry.allocatedAmount.amount * BigInt(Math.round(params.callPct * 100))) / 10000n;
      return {
        subscriptionId: entry.subscriptionId,
        amount: Money.of(minorUnit, currency),
      };
    });
  }
}