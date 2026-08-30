import { FeeStructure, Money } from '@daos/shared-kernel';

import { FeeModelCalculator } from '../../src/domain/services/fee-model-calculator';

const feeStructure: FeeStructure = {
  managementFeeAnnual: 2,
  performanceFee: 20,
  hurdleRate: 8,
  highWaterMark: true,
  catchUpPercentage: 10,
  catchUpRate: 20,
};

describe('FeeModelCalculator', () => {
  it('computes deterministic fee components for a gross amount', () => {
    const calculator = new FeeModelCalculator();
    const result = calculator.calculate(Money.of(10_000_000n, 'USD'), feeStructure);

    // managementFee = 10_000_000 * 2 / 100 = 200_000
    expect(result.managementFee.amount).toBe(200_000n);
    // performanceFee = 10_000_000 * 20 / 100 = 2_000_000
    expect(result.performanceFee.amount).toBe(2_000_000n);
    // carriedInterest = 10_000_000 * 10 / 100 = 1_000_000
    expect(result.carriedInterest.amount).toBe(1_000_000n);
    // netToInvestor = 10_000_000 - 200_000 - 2_000_000 - 1_000_000 = 6_800_000
    expect(result.netToInvestor.amount).toBe(6_800_000n);

    expect(result.managementFee.currency).toBe('USD');
  });

  it('returns zero fees for zero fees structure', () => {
    const calculator = new FeeModelCalculator();
    const zero: FeeStructure = {
      managementFeeAnnual: 0,
      performanceFee: 0,
      hurdleRate: 0,
      highWaterMark: false,
      catchUpPercentage: 0,
      catchUpRate: 0,
    };
    const result = calculator.calculate(Money.of(1_000_000n, 'USD'), zero);
    expect(result.managementFee.amount).toBe(0n);
    expect(result.performanceFee.amount).toBe(0n);
    expect(result.carriedInterest.amount).toBe(0n);
    expect(result.netToInvestor.amount).toBe(1_000_000n);
  });

  it('rejects a negative gross amount', () => {
    const calculator = new FeeModelCalculator();
    expect(() => calculator.calculate(Money.of(-1n, 'USD'), feeStructure)).toThrow(
      'Gross amount cannot be negative',
    );
  });

  it('rejects fees that exceed the gross amount', () => {
    const calculator = new FeeModelCalculator();
    const huge: FeeStructure = {
      managementFeeAnnual: 0,
      performanceFee: 0,
      hurdleRate: 0,
      highWaterMark: false,
      catchUpPercentage: 200,
      catchUpRate: 0,
    };
    expect(() => calculator.calculate(Money.of(100n, 'USD'), huge)).toThrow('Fees exceed gross amount');
  });
});
