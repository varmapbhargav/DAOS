import { CapitalStack, Money } from '@daos/shared-kernel';

import { CapitalStackValidator } from '../../src/domain/services/capital-stack-validator';

const validator = new CapitalStackValidator();

const goodStack: CapitalStack = {
  tranches: [
    { trancheType: 'senior', amount: Money.of(50000000n, 'USD'), coupon: 8, seniority: 1 },
    { trancheType: 'juniorDebt', amount: Money.of(25000000n, 'USD'), coupon: 12, seniority: 2 },
    { trancheType: 'commonEquity', amount: Money.of(10000000n, 'USD'), coupon: 0, seniority: 3 },
  ],
};

describe('CapitalStackValidator', () => {
  it('validates a correct capital stack', () => {
    const result = validator.validate(goodStack);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects an empty capital stack', () => {
    const result = validator.validate({ tranches: [] });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('at least one tranche');
  });

  it('rejects non-positive amounts', () => {
    const result = validator.validate({
      tranches: [{ trancheType: 'senior', amount: Money.of(0n, 'USD'), coupon: 8, seniority: 1 }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('positive'))).toBe(true);
  });

  it('rejects invalid tranche types', () => {
    const result = validator.validate({
      tranches: [
        {
          trancheType: 'bogus' as CapitalStack['tranches'][number]['trancheType'],
          amount: Money.of(100n, 'USD'),
          coupon: 5,
          seniority: 1,
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Invalid tranche type'))).toBe(true);
  });

  it('rejects negative coupons', () => {
    const result = validator.validate({
      tranches: [{ trancheType: 'senior', amount: Money.of(100n, 'USD'), coupon: -1, seniority: 1 }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('non-negative'))).toBe(true);
  });

  it('rejects tranches out of seniority order', () => {
    const result = validator.validate({
      tranches: [
        { trancheType: 'senior', amount: Money.of(100n, 'USD'), coupon: 8, seniority: 2 },
        { trancheType: 'juniorDebt', amount: Money.of(50n, 'USD'), coupon: 12, seniority: 1 },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('ordered'))).toBe(true);
  });

  it('calculates the total capital', () => {
    const total = validator.calculateTotal(goodStack);
    expect(total.amount).toBe(85000000n);
    expect(total.currency).toBe('USD');
  });
});
