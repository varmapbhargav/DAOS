import { DistributionType, WaterfallTier, WaterfallType } from '@daos/shared-kernel';

import { TaxWithholdingCalculator } from '../../src/domain/services/tax-withholding.calculator';
import { WaterfallCalculationService } from '../../src/domain/services/waterfall-calculation.service';

describe('WaterfallCalculationService', () => {
  const calculator = new WaterfallCalculationService(new TaxWithholdingCalculator());

  const tiers: WaterfallTier[] = [
    { tierOrder: 0, tierType: 'returnOfCapital', distributionRate: null, catchUpRate: null },
    { tierOrder: 1, tierType: 'preferredReturn', distributionRate: 40, catchUpRate: null },
    { tierOrder: 2, tierType: 'carriedInterest', distributionRate: 20, catchUpRate: null },
    { tierOrder: 3, tierType: 'commonEquity', distributionRate: null, catchUpRate: null },
  ];

  it('allocates the full gross amount across tiers in order', () => {
    const allocation = calculator.allocate('USD', 1_000_000n, tiers);
    const total = Object.values(allocation).reduce((a, b) => a + b, 0n);
    expect(total).toBe(1_000_000n);
    expect(allocation.carriedInterest).toBeGreaterThan(0n);
  });

  it('calculates investor distributions proportional to share holdings', () => {
    const result = calculator.calculate({
      currency: 'USD',
      grossAmount: 2_000_000n,
      distributionType: 'income' as DistributionType,
      waterfallType: 'hybrid' as WaterfallType,
      tiers,
      investorShares: [
        { investorId: 'investor-a', shares: 750 },
        { investorId: 'investor-b', shares: 250 },
      ],
    });

    expect(result.allocatedTotal).toBe(2_000_000n);
    expect(result.investorDistributions).toHaveLength(2);
    const investorA = result.investorDistributions.find((d) => d.investorId === 'investor-a');
    const investorB = result.investorDistributions.find((d) => d.investorId === 'investor-b');
    expect(investorA?.grossAmount.amount).toBeGreaterThan(investorB?.grossAmount.amount!);
  });

  it('carries interest and promote as the carried interest tier', () => {
    const result = calculator.calculate({
      currency: 'USD',
      grossAmount: 1_000_000n,
      distributionType: 'income' as DistributionType,
      waterfallType: 'european' as WaterfallType,
      tiers,
      investorShares: [{ investorId: 'investor-a', shares: 100 }],
    });
    expect(result.carriedInterest).toBe(result.promote);
    expect(result.carriedInterest).toBeGreaterThanOrEqual(0n);
  });
});

describe('TaxWithholdingCalculator', () => {
  const calculator = new TaxWithholdingCalculator();

  it('withholds 0% for FATCA-exempt holders', () => {
    expect(calculator.withhold(100_000n, { fatcaExempt: true })).toBe(0n);
  });

  it('withholds 15% under a tax treaty (W-8BEN)', () => {
    expect(calculator.withhold(100_000n, { treaty: true })).toBe(15_000n);
  });

  it('withholds 30% by default (W-8BEN)', () => {
    expect(calculator.withhold(100_000n, {})).toBe(30_000n);
  });

  it('computes net of withholding', () => {
    const gross = 100_000n;
    const withheld = calculator.withhold(gross, {});
    expect(gross - withheld).toBe(70_000n);
  });
});
