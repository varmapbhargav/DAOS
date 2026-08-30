import { DistributionId, DistributionType, InvestorDistribution, Money, TenantId } from '@daos/shared-kernel';

import { Distribution } from '../../src/domain/aggregates/distribution.aggregate';

describe('Distribution aggregate', () => {
  const tenantId = TenantId.create('tenant-1');

  function declare(overrides: Partial<Parameters<typeof Distribution.declare>[0]> = {}) {
    return Distribution.declare({
      tenantId,
      productId: 'product-1',
      distributionType: 'income' as DistributionType,
      currency: 'USD',
      totalAmount: 1_000_000n,
      recordDate: '2026-01-15',
      paymentDate: '2026-01-31',
      ...overrides,
    });
  }

  function investorDistribution(overrides: Partial<InvestorDistribution> = {}): InvestorDistribution {
    return {
      investorId: 'investor-1',
      shareCount: 100,
      grossAmount: Money.of(1_000_000n, 'USD'),
      withholdingTax: Money.of(0n, 'USD'),
      netAmount: Money.of(1_000_000n, 'USD'),
      ...overrides,
    };
  }

  it('declares a distribution and raises DistributionDeclared', () => {
    const d = declare();
    expect(d.id).toBeInstanceOf(DistributionId);
    expect(d.status).toBe('declared');
    expect(d.pullEvents().map((e) => e.eventType)).toContain('distribution.declared.v1');
  });

  it('rejects invalid declaration parameters', () => {
    expect(() => declare({ productId: '' })).toThrow('Product id is required');
    expect(() => declare({ totalAmount: 0n })).toThrow('Distribution amount must be positive');
  });

  it('calculates a declared distribution and raises DistributionCalculated', () => {
    const d = declare();
    d.pullEvents();
    d.calculate({
      investorDistributions: [investorDistribution()],
      promote: 100_000n,
      carriedInterest: 100_000n,
    });

    expect(d.status).toBe('calculated');
    expect(d.investorDistributions).toHaveLength(1);
    expect(d.promote).toBe(100_000n);
    expect(d.pullEvents().map((e) => e.eventType)).toContain('distribution.calculated.v1');
  });

  it('refuses to calculate an already-calculated distribution', () => {
    const d = declare();
    d.pullEvents();
    d.calculate({ investorDistributions: [investorDistribution()], promote: 0n, carriedInterest: 0n });
    d.pullEvents();
    expect(() =>
      d.calculate({ investorDistributions: [investorDistribution()], promote: 0n, carriedInterest: 0n }),
    ).toThrow('Only declared distributions can be calculated');
  });

  it('approves a calculated distribution and raises DistributionApproved', () => {
    const d = declare();
    d.pullEvents();
    d.calculate({ investorDistributions: [investorDistribution()], promote: 0n, carriedInterest: 0n });
    d.pullEvents();
    d.approve();

    expect(d.status).toBe('approved');
    expect(d.pullEvents().map((e) => e.eventType)).toContain('distribution.approved.v1');
  });

  it('refuses to approve before calculation', () => {
    const d = declare();
    expect(() => d.approve()).toThrow('Only calculated distributions can be approved');
  });

  it('pays an approved distribution raising DistributionPaid and PromoteDistributed', () => {
    const d = declare();
    d.pullEvents();
    d.calculate({ investorDistributions: [investorDistribution()], promote: 500n, carriedInterest: 500n });
    d.pullEvents();
    d.approve();
    d.pullEvents();
    d.pay();

    expect(d.status).toBe('paid');
    const eventTypes = d.pullEvents().map((e) => e.eventType);
    expect(eventTypes).toContain('distribution.paid.v1');
    expect(eventTypes).toContain('promote.distributed.v1');
  });

  it('refuses to pay before approval', () => {
    const d = declare();
    expect(() => d.pay()).toThrow('Only approved distributions can be paid');
  });
});
