import { CapitalCallId, Money, TenantId } from '@daos/shared-kernel';

import { CapitalCall } from '../../src/domain/aggregates/capital-call.aggregate';

const tenantId = TenantId.create('tenant-dist');

function issue(): CapitalCall {
  return CapitalCall.issue({
    tenantId,
    closingId: 'closing-1',
    investorId: 'investor-1',
    amount: Money.of(50000000n, 'USD'),
    dueDate: '2026-10-15',
  });
}

describe('CapitalCall aggregate', () => {
  it('issues a call and raises event', () => {
    const c = issue();
    expect(c.status).toBe('issued');
    expect(c.amountFunded.amount).toBe(0n);
    expect(c.pullEvents().map((e) => e.eventType)).toContain('capital-call.issued.v1');
  });

  it('validates required fields and positive amount', () => {
    expect(() =>
      CapitalCall.issue({
        tenantId,
        closingId: 'closing-1',
        investorId: '',
        amount: Money.of(1n, 'USD'),
        dueDate: '2026-10-15',
      }),
    ).toThrow('Investor id is required');
    expect(() =>
      CapitalCall.issue({
        tenantId,
        closingId: 'closing-1',
        investorId: 'i',
        amount: Money.of(1n, 'USD'),
        dueDate: '',
      }),
    ).toThrow('Due date is required');
    expect(() =>
      CapitalCall.issue({
        tenantId,
        closingId: 'closing-1',
        investorId: 'i',
        amount: Money.of(0n, 'USD'),
        dueDate: '2026-10-15',
      }),
    ).toThrow('Capital call amount must be positive');
  });

  it('records partial then full funding', () => {
    const c = issue();
    c.recordFunding(Money.of(20000000n, 'USD'));
    expect(c.status).toBe('partiallyFunded');
    expect(c.amountFunded.amount).toBe(20000000n);
    c.recordFunding(Money.of(30000000n, 'USD'));
    expect(c.status).toBe('funded');
    expect(c.fundedAt).not.toBeNull();
    expect(c.pullEvents().map((e) => e.eventType)).toContain('capital-call.funded.v1');
  });

  it('rejects over-funding', () => {
    const c = issue();
    c.recordFunding(Money.of(40000000n, 'USD'));
    expect(() => c.recordFunding(Money.of(20000000n, 'USD'))).toThrow(
      'Funding exceeds the capital call amount',
    );
  });

  it('rejects funding a fully-funded call', () => {
    const c = issue();
    c.recordFunding(Money.of(50000000n, 'USD'));
    expect(() => c.recordFunding(Money.of(1n, 'USD'))).toThrow('Capital call already fully funded');
  });

  it('rejects currency mismatch', () => {
    const c = issue();
    expect(() => c.recordFunding(Money.of(100n, 'EUR'))).toThrow('Currency mismatch');
  });

  it('marks a defaulted call', () => {
    const c = issue();
    c.markDefaulted();
    expect(c.status).toBe('defaulted');
  });

  it('refuses to default a funded call', () => {
    const c = issue();
    c.recordFunding(Money.of(50000000n, 'USD'));
    expect(() => c.markDefaulted()).toThrow('Funded capital calls cannot be defaulted');
  });

  it('reconstructs preserving version', () => {
    const c = issue();
    const clone = CapitalCall.reconstruct({
      id: CapitalCallId.create(c.id.value),
      tenantId: c.tenantId,
      closingId: c.closingId,
      investorId: c.investorId,
      amount: c.amount,
      amountFunded: c.amountFunded,
      status: c.status,
      dueDate: c.dueDate,
      fundedAt: c.fundedAt,
      version: c.version,
    });
    expect(clone.version).toBe(c.version);
    expect(clone.amountFunded.amount).toBe(0n);
    expect(clone.pullEvents()).toHaveLength(0);
  });
});
