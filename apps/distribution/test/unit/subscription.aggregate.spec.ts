import { Money, SubscriptionId, TenantId } from '@daos/shared-kernel';

import { Subscription } from '../../src/domain/aggregates/subscription.aggregate';

const tenantId = TenantId.create('tenant-dist');

function receive(): Subscription {
  return Subscription.receive({
    tenantId,
    productId: 'product-1',
    investorId: 'investor-1',
    requestedAmount: Money.of(100000000n, 'USD'),
  });
}

describe('Subscription aggregate', () => {
  it('receives into draft and raises an event', () => {
    const s = receive();
    expect(s.status).toBe('draft');
    expect(s.requestedAmount.amount).toBe(100000000n);
    expect(s.pullEvents().map((e) => e.eventType)).toContain('subscription.received.v1');
  });

  it('validates required fields and positive amount', () => {
    expect(() =>
      Subscription.receive({ tenantId, productId: ' ', investorId: 'i', requestedAmount: Money.of(1n, 'USD') }),
    ).toThrow('Product id is required');
    expect(() =>
      Subscription.receive({ tenantId, productId: 'p', investorId: '', requestedAmount: Money.of(1n, 'USD') }),
    ).toThrow('Investor id is required');
    expect(() =>
      Subscription.receive({ tenantId, productId: 'p', investorId: 'i', requestedAmount: Money.of(0n, 'USD') }),
    ).toThrow('Requested amount must be positive');
  });

  it('moves through the send/execute lifecycle', () => {
    const s = receive();
    s.sendDocuments();
    expect(s.status).toBe('documentsSent');
    expect(s.pullEvents().map((e) => e.eventType)).toContain('subscription.documents-sent.v1');
    s.executeDocuments();
    expect(s.status).toBe('documentsExecuted');
    expect(s.pullEvents().map((e) => e.eventType)).toContain('subscription.executed.v1');
  });

  it('requires documents to be sent before execution', () => {
    const s = receive();
    expect(() => s.executeDocuments()).toThrow('Documents must be sent before execution');
  });

  it('approves an allocation then funds', () => {
    const s = receive();
    s.approveAllocation(Money.of(50000000n, 'USD'), 50);
    expect(s.status).toBe('allocated');
    expect(s.allocatedAmount?.amount).toBe(50000000n);
    expect(s.pullEvents().map((e) => e.eventType)).toContain('allocation.approved.v1');
    s.fund('pgw-1');
    expect(s.status).toBe('funded');
    expect(s.paymentRef).toBe('pgw-1');
    expect(s.fundedAt).not.toBeNull();
    expect(s.pullEvents().map((e) => e.eventType)).toContain('subscription.funded.v1');
  });

  it('requires allocation before funding', () => {
    const s = receive();
    expect(() => s.fund('pgw-1')).toThrow('Subscription must be allocated before funding');
  });

  it('rejects allocated but not funded subscriptions', () => {
    const s = receive();
    s.approveAllocation(Money.of(50000000n, 'USD'), 50);
    s.reject('AML failed');
    expect(s.status).toBe('rejected');
    expect(s.rejectReason).toBe('AML failed');
    expect(s.pullEvents().map((e) => e.eventType)).toContain('subscription.rejected.v1');
  });

  it('refuses to reallocate a funded subscription', () => {
    const s = receive();
    s.approveAllocation(Money.of(50000000n, 'USD'), 50);
    s.fund('pgw-1');
    expect(() => s.approveAllocation(Money.of(60000000n, 'USD'), 60)).toThrow(
      'Funded subscriptions cannot be reallocated',
    );
    expect(() => s.reject('nope')).toThrow('Funded subscriptions cannot be rejected');
  });

  it('provides a sort key of receivedAt#id', () => {
    const s = receive();
    expect(s.getSortKey()).toBe(`${s.receivedAt}#${s.id.value}`);
  });

  it('reconstructs preserving version', () => {
    const s = receive();
    const clone = Subscription.reconstruct({
      id: SubscriptionId.create(s.id.value),
      tenantId: s.tenantId,
      productId: s.productId,
      investorId: s.investorId,
      requestedAmount: s.requestedAmount,
      status: s.status,
      allocatedAmount: s.allocatedAmount,
      allocationPct: s.allocationPct,
      paymentRef: s.paymentRef,
      rejectReason: s.rejectReason,
      fundedAt: s.fundedAt,
      receivedAt: s.receivedAt,
      version: s.version,
    });
    expect(clone.version).toBe(s.version);
    expect(clone.id.value).toBe(s.id.value);
    expect(clone.pullEvents()).toHaveLength(0);
  });
});
