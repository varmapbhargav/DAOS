import { Money } from '@daos/shared-kernel';
import {
  DistributionWaterfall,
  TierAllocation,
  WaterfallCalculationTrace,
} from '../aggregates/distribution-waterfall.aggregate';

/**
 * Pure domain service — calculates waterfall distributions tier by tier.
 *
 * Flow:
 *   Cash Available
 *     → Operating Expenses  (priority 1)
 *     → Senior Debt Service (priority 2)
 *     → Preferred Return    (priority 3, hurdle-rate based)
 *     → Catch-up            (priority 4)
 *     → Promote / Carry     (priority 5)
 *     → Residual            (priority 6+)
 */
export class WaterfallCalculationEngine {
  calculate(
    waterfall: DistributionWaterfall,
    availableForDistribution: Money,
  ): WaterfallCalculationTrace {
    const currency = availableForDistribution.currency;
    let remaining = availableForDistribution;
    const allocations: TierAllocation[] = [];

    const sortedTiers = [...waterfall.tiers].sort((a, b) => a.priority - b.priority);

    for (const tier of sortedTiers) {
      if (remaining.amount <= 0n) {
        allocations.push({
          tierId: tier.tierId,
          priority: tier.priority,
          recipient: tier.recipient,
          distributionType: tier.distributionType,
          allocated: Money.zero(currency),
          remaining: Money.zero(currency),
          catchUpApplied: false,
        });
        continue;
      }

      let toAllocate = remaining;
      let catchUpApplied = false;

      // Threshold cap (e.g. senior debt has a fixed amount)
      if (tier.thresholdAmount !== null) {
        const threshold = tier.thresholdAmount;
        if (remaining.amount >= threshold.amount) {
          toAllocate = threshold;
        }
      }

      // Hurdle-rate preferred return: allocate only up to hurdle × invested capital
      // For simplicity here, hurdle is expressed as an absolute threshold cap.
      // Production use: caller passes invested capital and engine computes hurdle.

      // Percentage allocation — split remaining by allocationPct
      if (tier.allocationPercentage < 100) {
        const pctAmount = (remaining.amount * BigInt(Math.round(tier.allocationPercentage * 100))) / 10000n;
        const pctMoney = Money.of(pctAmount, currency);
        // Take the smaller of threshold cap and percentage
        if (tier.thresholdAmount !== null) {
          toAllocate = pctMoney.amount < toAllocate.amount ? pctMoney : toAllocate;
        } else {
          toAllocate = pctMoney;
        }
      }

      // Catch-up rule: if catch-up applies, allocate all remaining up to catch-up pct
      if (tier.catchUpApplies && tier.catchUpPercentage !== null) {
        const catchUpAmount = (remaining.amount * BigInt(Math.round(tier.catchUpPercentage * 100))) / 10000n;
        toAllocate = Money.of(catchUpAmount > remaining.amount ? remaining.amount : catchUpAmount, currency);
        catchUpApplied = true;
      }

      // Never allocate more than what's available
      if (toAllocate.amount > remaining.amount) {
        toAllocate = remaining;
      }

      remaining = remaining.subtract(toAllocate);

      allocations.push({
        tierId: tier.tierId,
        priority: tier.priority,
        recipient: tier.recipient,
        distributionType: tier.distributionType,
        allocated: toAllocate,
        remaining,
        catchUpApplied,
      });
    }

    const totalAllocated = Money.of(
      availableForDistribution.amount - remaining.amount,
      currency,
    );

    return {
      calculatedAt: new Date().toISOString(),
      availableForDistribution,
      totalAllocated,
      residualRemaining: remaining,
      allocations,
    };
  }
}
