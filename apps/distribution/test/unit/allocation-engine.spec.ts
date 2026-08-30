import { Money, SubscriptionStatus, TenantId } from '@daos/shared-kernel';

import { Subscription } from '../../src/domain/aggregates/subscription.aggregate';
import { AllocationEngine } from '../../src/domain/services/allocation-engine';

const tenantId = TenantId.create('tenant-dist');

function sub(id: string, amount: bigint, receivedAt: string): Subscription {
  const s = Subscription.receive({
    tenantId,
    productId: 'product-1',
    investorId: `investor-${id}`,
    requestedAmount: Money.of(amount, 'USD'),
  });
  // override receivedAt to control FCFS ordering
  return Subscription.reconstruct({
    id: s.id,
    tenantId,
    productId: s.productId,
    investorId: s.investorId,
    requestedAmount: s.requestedAmount,
    status: s.status as SubscriptionStatus,
    allocatedAmount: s.allocatedAmount,
    allocationPct: s.allocationPct,
    paymentRef: s.paymentRef,
    rejectReason: s.rejectReason,
    fundedAt: s.fundedAt,
    receivedAt,
    version: s.version,
  });
}

describe('AllocationEngine', () => {
  const engine = new AllocationEngine();

  it('allocates pro-rata proportionally with exact total', () => {
    const subs = [sub('a', 3000000n, '2026-01-01T00:00:00Z'), sub('b', 7000000n, '2026-01-02T00:00:00Z')];
    const entries = engine.allocate({
      method: 'proRata',
      totalAmount: Money.of(1000000n, 'USD'),
      subscriptions: subs,
    });
    const total = entries.reduce((sum, e) => sum + e.allocatedAmount.amount, 0n);
    expect(total).toBe(1000000n);
    expect(entries).toHaveLength(2);
    entries.forEach((e) => {
      expect(e.allocatedAmount.currency).toBe('USD');
      expect(e.allocationPct).toBeGreaterThan(0);
    });
  });

  it('distributes remainder so the allocated sum exactly matches total', () => {
    const subs = [
      sub('a', 333333n, '2026-01-01T00:00:00Z'),
      sub('b', 333333n, '2026-01-02T00:00:00Z'),
      sub('c', 333334n, '2026-01-03T00:00:00Z'),
    ];
    const total = Money.of(1000000n, 'USD');
    const entries = engine.allocate({ method: 'proRata', totalAmount: total, subscriptions: subs });
    const sum = entries.reduce((s, e) => s + e.allocatedAmount.amount, 0n);
    expect(sum).toBe(total.amount);
  });

  it('returns empty for no subscriptions', () => {
    expect(engine.allocate({ method: 'proRata', totalAmount: Money.of(100n, 'USD'), subscriptions: [] })).toEqual([]);
  });

  it('allocates first-come-first-served by receipt order', () => {
    const aSub = sub('a', 1000000n, '2026-01-03T00:00:00Z');
    const bSub = sub('b', 1000000n, '2026-01-01T00:00:00Z');
    const cSub = sub('c', 1000000n, '2026-01-02T00:00:00Z');
    const entries = engine.allocate({
      method: 'firstComeFirstServed',
      totalAmount: Money.of(1500000n, 'USD'),
      subscriptions: [aSub, bSub, cSub],
    });
    expect(entries[0].subscriptionId).toBe(bSub.id.value);
    expect(entries[1].subscriptionId).toBe(cSub.id.value);
    expect(entries).toHaveLength(2);
    const sum = entries.reduce((s, e) => s + e.allocatedAmount.amount, 0n);
    expect(sum).toBe(1500000n);
  });

  it('throws for discretionary', () => {
    expect(() =>
      engine.allocate({
        method: 'discretionary',
        totalAmount: Money.of(100n, 'USD'),
        subscriptions: [sub('a', 100n, '2026-01-01T00:00:00Z')],
      }),
    ).toThrow('Discretionary allocations require manual assignment');
  });

  it('rejects a negative total', () => {
    expect(() =>
      engine.allocate({
        method: 'proRata',
        totalAmount: Money.of(-1n, 'USD'),
        subscriptions: [sub('a', 100n, '2026-01-01T00:00:00Z')],
      }),
    ).toThrow('Allocation total cannot be negative');
  });
});
