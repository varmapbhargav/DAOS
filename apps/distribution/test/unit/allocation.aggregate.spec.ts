import { AllocationId, Money, SubscriptionAllocation, TenantId } from '@daos/shared-kernel';

import { Allocation } from '../../src/domain/aggregates/allocation.aggregate';

const tenantId = TenantId.create('tenant-dist');

function entry(subscriptionId: string, allocated: bigint): SubscriptionAllocation {
  return {
    subscriptionId,
    requestedAmount: Money.of(allocated, 'USD'),
    allocatedAmount: Money.of(allocated, 'USD'),
    allocationPct: 50,
  };
}

describe('Allocation aggregate', () => {
  it('creates in draft', () => {
    const a = Allocation.create({
      tenantId,
      closingId: 'closing-1',
      productId: 'product-1',
      method: 'proRata',
      totalAmount: Money.of(100000000n, 'USD'),
    });
    expect(a.status).toBe('draft');
    expect(a.entries).toHaveLength(0);
    expect(a.version).toBe(1);
  });

  it('sets entries and totals to match', () => {
    const a = Allocation.create({
      tenantId,
      closingId: 'closing-1',
      productId: 'product-1',
      method: 'proRata',
      totalAmount: Money.of(100000000n, 'USD'),
    });
    a.setEntries([entry('sub-1', 60000000n), entry('sub-2', 40000000n)]);
    expect(a.entries).toHaveLength(2);
  });

  it('rejects entries that do not sum to total', () => {
    const a = Allocation.create({
      tenantId,
      closingId: 'closing-1',
      productId: 'product-1',
      method: 'proRata',
      totalAmount: Money.of(100000000n, 'USD'),
    });
    expect(() => a.setEntries([entry('sub-1', 60000000n), entry('sub-2', 30000000n)])).toThrow(
      'Allocated total must equal the allocation totalAmount',
    );
  });

  it('finalizes and raises an approved event per entry', () => {
    const a = Allocation.create({
      tenantId,
      closingId: 'closing-1',
      productId: 'product-1',
      method: 'proRata',
      totalAmount: Money.of(100000000n, 'USD'),
    });
    a.setEntries([entry('sub-1', 60000000n), entry('sub-2', 40000000n)]);
    a.finalize();
    expect(a.status).toBe('finalized');
    expect(a.pullEvents().map((e) => e.eventType)).toEqual(['allocation.approved.v1', 'allocation.approved.v1']);
  });

  it('refuses to finalize with no entries', () => {
    const a = Allocation.create({
      tenantId,
      closingId: 'closing-1',
      productId: 'product-1',
      method: 'proRata',
      totalAmount: Money.of(100000000n, 'USD'),
    });
    expect(() => a.finalize()).toThrow('Cannot finalize an allocation with no entries');
  });

  it('publishes a finalized allocation', () => {
    const a = Allocation.create({
      tenantId,
      closingId: 'closing-1',
      productId: 'product-1',
      method: 'proRata',
      totalAmount: Money.of(100000000n, 'USD'),
    });
    a.setEntries([entry('sub-1', 100000000n)]);
    a.finalize();
    a.publish();
    expect(a.status).toBe('published');
  });

  it('looks up an entry by subscription', () => {
    const a = Allocation.create({
      tenantId,
      closingId: 'closing-1',
      productId: 'product-1',
      method: 'proRata',
      totalAmount: Money.of(100000000n, 'USD'),
    });
    const entries = [entry('sub-1', 60000000n), entry('sub-2', 40000000n)];
    a.setEntries(entries);
    expect(a.entryFor('sub-2')?.allocatedAmount.amount).toBe(40000000n);
    expect(a.entryFor('missing')).toBeNull();
  });

  it('reconstructs preserving version', () => {
    const a = Allocation.create({
      tenantId,
      closingId: 'closing-1',
      productId: 'product-1',
      method: 'proRata',
      totalAmount: Money.of(100000000n, 'USD'),
    });
    const entries = [entry('sub-1', 100000000n)];
    a.setEntries(entries);
    const clone = Allocation.reconstruct({
      id: AllocationId.create(a.id.value),
      tenantId: a.tenantId,
      closingId: a.closingId,
      productId: a.productId,
      method: a.method,
      totalAmount: a.totalAmount,
      entries: a.entries,
      status: a.status,
      version: a.version,
    });
    expect(clone.version).toBe(a.version);
    expect(clone.entries).toHaveLength(1);
    expect(clone.pullEvents()).toHaveLength(0);
  });
});
