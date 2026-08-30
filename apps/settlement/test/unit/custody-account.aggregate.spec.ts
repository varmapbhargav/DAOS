import { CustodyAccountId, Money, TenantId } from '@daos/shared-kernel';

import { CustodyAccount } from '../../src/domain/aggregates/custody-account.aggregate';

describe('CustodyAccount aggregate', () => {
  const tenantId = TenantId.create('tenant-1');

  function openAccount() {
    return CustodyAccount.open({
      tenantId,
      investorId: 'investor-1',
      custodyType: 'broker',
      custodianRef: 'custodian-ref-1',
    });
  }

  it('opens a custody account', () => {
    const account = openAccount();

    expect(account.id).toBeInstanceOf(CustodyAccountId);
    expect(account.investorId).toBe('investor-1');
    expect(account.holdings).toHaveLength(0);
  });

  it('requires investor id and custodian reference', () => {
    expect(() => CustodyAccount.open({ tenantId, investorId: ' ', custodyType: 'broker', custodianRef: 'ref' })).toThrow('Investor id is required');
    expect(() => CustodyAccount.open({ tenantId, investorId: 'investor-1', custodyType: 'broker', custodianRef: ' ' })).toThrow('Custodian reference is required');
  });

  it('credits a holding and raises CustodyUpdated', () => {
    const account = openAccount();
    account.pullEvents();
    account.creditHolding({ securityId: 'security-1', quantity: 100n, price: Money.of(100n, 'USD') });

    const holding = account.getHolding('security-1');
    expect(holding).not.toBeNull();
    expect(holding?.available).toBe(100n);
    expect(holding?.averagePrice.amount).toBe(100n);
    expect(account.pullEvents().map((e) => e.eventType)).toContain('custody.updated.v1');
  });

  it('recomputes the average price across credits', () => {
    const account = openAccount();
    account.creditHolding({ securityId: 'security-1', quantity: 100n, price: Money.of(100n, 'USD') });
    account.creditHolding({ securityId: 'security-1', quantity: 100n, price: Money.of(300n, 'USD') });

    const holding = account.getHolding('security-1');
    expect(holding?.quantity).toBe(200n);
    expect(holding?.averagePrice.amount).toBe(200n);
  });

  it('rejects a debit exceeding the available quantity', () => {
    const account = openAccount();
    account.creditHolding({ securityId: 'security-1', quantity: 100n, price: Money.of(100n, 'USD') });
    expect(() => account.debitHolding('security-1', 150n)).toThrow('Insufficient available quantity');
  });

  it('locks holdings and moves quantity from available to locked', () => {
    const account = openAccount();
    account.creditHolding({ securityId: 'security-1', quantity: 100n, price: Money.of(100n, 'USD') });
    account.lockHolding('security-1', 40n);

    const holding = account.getHolding('security-1');
    expect(holding?.available).toBe(60n);
    expect(holding?.locked).toBe(40n);
  });
});
