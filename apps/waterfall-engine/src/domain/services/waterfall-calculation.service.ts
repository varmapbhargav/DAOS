import { DistributionType, InvestorDistribution, Money, WaterfallTier, WaterfallTierType, WaterfallType } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

import { TaxProfile, TaxWithholdingCalculator } from './tax-withholding.calculator';

export type InvestorShare = {
  investorId: string;
  shares: number;
};

export type WaterfallCalculationInput = {
  currency: string;
  grossAmount: bigint;
  distributionType: DistributionType;
  waterfallType: WaterfallType;
  tiers: WaterfallTier[];
  investorShares: InvestorShare[];
  taxProfiles?: Record<string, TaxProfile>;
};

export type WaterfallCalculationResult = {
  investorDistributions: InvestorDistribution[];
  promote: bigint;
  carriedInterest: bigint;
  allocatedTotal: bigint;
};

@Injectable()
export class WaterfallCalculationService {
  constructor(private readonly taxCalculator: TaxWithholdingCalculator) {}

  allocate(currency: string, grossAmount: bigint, tiers: WaterfallTier[]): Record<WaterfallTierType, bigint> {
    const sorted = [...tiers].sort((a, b) => a.tierOrder - b.tierOrder);
    const allocation: Record<WaterfallTierType, bigint> = {
      returnOfCapital: 0n,
      preferredReturn: 0n,
      catchUp: 0n,
      carriedInterest: 0n,
      commonEquity: 0n,
    };

    let remaining = grossAmount;
    for (let i = 0; i < sorted.length; i++) {
      const tier = sorted[i];
      const isLast = i === sorted.length - 1;
      let portion: bigint;
      if (isLast) {
        portion = remaining;
      } else {
        const rate = tier.tierType === 'catchUp' ? (tier.catchUpRate ?? 0) : (tier.distributionRate ?? 0);
        portion = remaining <= 0n ? 0n : (grossAmount * BigInt(Math.round(rate * 100)) + 50n) / 100n / 100n;
        if (portion > remaining) portion = remaining;
      }
      allocation[tier.tierType] = portion;
      remaining -= portion;
      if (remaining <= 0n) break;
    }

    return allocation;
  }

  calculate(input: WaterfallCalculationInput): WaterfallCalculationResult {
    const allocation = this.allocate(input.currency, input.grossAmount, input.tiers);
    const totalShares = input.investorShares.reduce((sum, s) => sum + s.shares, 0);
    if (totalShares <= 0) throw new Error('Total shares must be positive');

    const promote = allocation.carriedInterest;
    const investorDistributions: InvestorDistribution[] = input.investorShares.map((share) => {
      const shareFraction = share.shares / totalShares;
      const gross = (input.grossAmount * BigInt(Math.round(shareFraction * 1_000_000)) + 500_000n) / 1_000_000n;
      const profile = input.taxProfiles?.[share.investorId] ?? {};
      const withholding = this.taxCalculator.withhold(gross, profile);
      return {
        investorId: share.investorId,
        shareCount: share.shares,
        grossAmount: Money.of(gross, input.currency),
        withholdingTax: Money.of(withholding, input.currency),
        netAmount: Money.of(gross - withholding, input.currency),
      };
    });

    return {
      investorDistributions,
      promote,
      carriedInterest: promote,
      allocatedTotal: input.grossAmount,
    };
  }
}
