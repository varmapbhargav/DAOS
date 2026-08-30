import { Money, SubscriptionAllocation } from '@daos/shared-kernel';

import { CapitalCallCalculator } from '../../src/domain/services/capital-call-calculator';

function entry(subscriptionId: string, allocated: bigint): SubscriptionAllocation {
  return {
    subscriptionId,
    requestedAmount: Money.of(allocated, 'USD'),
    allocatedAmount: Money.of(allocated, 'USD'),
    allocationPct: 100,
  };
}

describe('CapitalCallCalculator', () => {
  const calc = new CapitalCallCalculator();

  it('computes a percentage of the allocated amount', () => {
    const entries = [entry('sub-1', 10000000n), entry('sub-2', 25000000n)];
    const result = calc.calculate({ entries, callPct: 20 });
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ subscriptionId: 'sub-1', amount: Money.of(2000000n, 'USD') });
    expect(result[1]).toEqual({ subscriptionId: 'sub-2', amount: Money.of(5000000n, 'USD') });
  });

  it('handles fractional percentages', () => {
    const entries = [entry('sub-1', 10000000n)];
    const result = calc.calculate({ entries, callPct: 12.5 });
    expect(result[0].amount.amount).toBe(1250000n);
  });

  it('returns empty for no entries', () => {
    expect(calc.calculate({ entries: [], callPct: 50 })).toEqual([]);
  });

  it('rejects out-of-range call percentage', () => {
    const entries = [entry('sub-1', 100n)];
    expect(() => calc.calculate({ entries, callPct: 0 })).toThrow(
      'Call percentage must be between 0 and 100',
    );
    expect(() => calc.calculate({ entries, callPct: 101 })).toThrow(
      'Call percentage must be between 0 and 100',
    );
  });
});
