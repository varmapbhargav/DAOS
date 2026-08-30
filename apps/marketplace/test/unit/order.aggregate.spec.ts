import { Money, OrderId, OrderSide, OrderType, TenantId } from '@daos/shared-kernel';

import { Order } from '../../src/domain/aggregates/order.aggregate';

describe('Order aggregate', () => {
  const tenantId = TenantId.create('tenant-1');

  function placeOrder(overrides: Partial<Parameters<typeof Order.place>[0]> = {}) {
    return Order.place({
      tenantId,
      listingId: 'listing-1',
      investorId: 'investor-1',
      side: 'buy' as OrderSide,
      orderType: 'limit' as OrderType,
      quantity: 100n,
      limitPrice: Money.of(100n, 'USD'),
      ...overrides,
    });
  }

  it('places a new order and raises OrderPlaced', () => {
    const order = placeOrder();

    expect(order.id).toBeInstanceOf(OrderId);
    expect(order.status).toBe('new');
    expect(order.openQuantity).toBe(100n);
    expect(order.pullEvents().map((e) => e.eventType)).toContain('order.placed.v1');
  });

  it('requires a limit price for limit orders', () => {
    expect(() => placeOrder({ orderType: 'limit' as OrderType, limitPrice: null })).toThrow(
      'Limit price is required for limit and stop orders',
    );
  });

  it('marks an order filled when fully filled and raises OrderFilled', () => {
    const order = placeOrder();
    order.pullEvents();
    order.applyFill({ quantity: 100n, price: Money.of(100n, 'USD'), tradeId: 'trade-1' });

    expect(order.status).toBe('filled');
    expect(order.filledQuantity).toBe(100n);
    expect(order.pullEvents().map((e) => e.eventType)).toContain('order.filled.v1');
  });

  it('marks an order partially filled and raises OrderPartiallyFilled', () => {
    const order = placeOrder();
    order.pullEvents();
    order.applyFill({ quantity: 40n, price: Money.of(100n, 'USD'), tradeId: 'trade-1' });

    expect(order.status).toBe('partiallyFilled');
    expect(order.openQuantity).toBe(60n);
    expect(order.pullEvents().map((e) => e.eventType)).toContain('order.partially-filled.v1');
  });

  it('refuses a fill that exceeds the open quantity', () => {
    const order = placeOrder();
    order.pullEvents();
    expect(() => order.applyFill({ quantity: 150n, price: Money.of(100n, 'USD'), tradeId: 'trade-1' })).toThrow(
      'Fill exceeds open quantity',
    );
  });

  it('cancels an open order and rejects cancelling a filled order', () => {
    const order = placeOrder();
    order.pullEvents();
    order.cancel();

    expect(order.status).toBe('cancelled');
    expect(order.pullEvents().map((e) => e.eventType)).toContain('order.cancelled.v1');

    const filled = placeOrder();
    filled.pullEvents();
    filled.applyFill({ quantity: 100n, price: Money.of(100n, 'USD'), tradeId: 'trade-1' });
    filled.pullEvents();
    expect(() => filled.cancel()).toThrow('Filled orders cannot be cancelled');
  });
});
