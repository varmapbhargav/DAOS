import { Money, TenantId, TradeId } from '@daos/shared-kernel';

import { Trade } from '../../src/domain/aggregates/trade.aggregate';

describe('Trade aggregate', () => {
  const tenantId = TenantId.create('tenant-1');

  function executeTrade() {
    return Trade.execute({
      tenantId,
      listingId: 'listing-1',
      buyOrderId: 'buy-1',
      sellOrderId: 'sell-1',
      quantity: 100n,
      price: Money.of(100n, 'USD'),
    });
  }

  it('executes a trade and raises TradeExecuted', () => {
    const trade = executeTrade();

    expect(trade.id).toBeInstanceOf(TradeId);
    expect(trade.status).toBe('executed');
    expect(trade.buyOrderId).toBe('buy-1');
    expect(trade.sellOrderId).toBe('sell-1');
    expect(trade.pullEvents().map((e) => e.eventType)).toContain('trade.executed.v1');
  });

  it('requires both order ids, positive quantity and price', () => {
    expect(() => Trade.execute({ tenantId, listingId: 'listing-1', buyOrderId: '', sellOrderId: 'sell-1', quantity: 100n, price: Money.of(100n, 'USD') })).toThrow('Both order ids are required');
    expect(() => Trade.execute({ tenantId, listingId: 'listing-1', buyOrderId: 'buy-1', sellOrderId: 'sell-1', quantity: 0n, price: Money.of(100n, 'USD') })).toThrow('Trade quantity must be positive');
    expect(() => Trade.execute({ tenantId, listingId: 'listing-1', buyOrderId: 'buy-1', sellOrderId: 'sell-1', quantity: 100n, price: Money.of(0n, 'USD') })).toThrow('Trade price must be positive');
  });

  it('marks a trade settled and then refuses failure after settlement', () => {
    const trade = executeTrade();
    trade.pullEvents();
    trade.markSettled();
    expect(trade.status).toBe('settled');
    expect(() => trade.markFailed()).toThrow('Settled trades cannot be marked failed');
  });

  it('marks a trade failed', () => {
    const trade = executeTrade();
    trade.markFailed();
    expect(trade.status).toBe('failed');
  });
});
