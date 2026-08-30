import { Money, OrderId, OrderSide, OrderType, TenantId } from '@daos/shared-kernel';

import { Order } from '../../src/domain/aggregates/order.aggregate';
import { OrderMatchingEngine } from '../../src/domain/services/order-matching-engine';

describe('OrderMatchingEngine', () => {
  const engine = new OrderMatchingEngine();
  const tenantId = TenantId.create('tenant-1');
  const listingId = 'listing-1';

  function restingSell(quantity: number, price: number, at: string, id = `sell-${at}-${price}`): Order {
    return Order.reconstruct({
      id: OrderId.create(id),
      tenantId,
      listingId,
      investorId: 'seller-1',
      side: 'sell' as OrderSide,
      orderType: 'limit' as OrderType,
      quantity: BigInt(quantity),
      limitPrice: Money.of(BigInt(price), 'USD'),
      filledQuantity: 0n,
      status: 'new',
      placedAt: at,
      version: 1,
    });
  }

  function aggressorBuy(quantity: number, orderType: OrderType = 'market', price?: number): Order {
    return Order.reconstruct({
      id: OrderId.create('buy-agg'),
      tenantId,
      listingId,
      investorId: 'buyer-1',
      side: 'buy' as OrderSide,
      orderType,
      quantity: BigInt(quantity),
      limitPrice: price != null ? Money.of(BigInt(price), 'USD') : null,
      filledQuantity: 0n,
      status: 'new',
      placedAt: '2026-01-01T00:00:00.000Z',
      version: 1,
    });
  }

  it('matches a market buy against the lowest resting sell price', () => {
    const book = [restingSell(10, 110, '2026-01-01T00:10:00.000Z'), restingSell(10, 105, '2026-01-01T00:10:00.000Z')];
    const outcome = engine.match(aggressorBuy(10), book);

    expect(outcome.matches).toHaveLength(1);
    expect(outcome.matches[0].sellOrderId).toBe(book[1].id.value);
    expect(outcome.matches[0].price.amount).toBe('105');
    expect(outcome.remaining).toBe(0n);
  });

  it('breaks ties by time priority (earliest arrival first)', () => {
    const early = restingSell(5, 100, '2026-01-01T00:05:00.000Z', 'sell-early');
    const late = restingSell(5, 100, '2026-01-01T00:08:00.000Z', 'sell-late');
    const outcome = engine.match(aggressorBuy(5), [late, early]);

    expect(outcome.matches).toHaveLength(1);
    expect(outcome.matches[0].sellOrderId).toBe(early.id.value);
  });

  it('fills across multiple resting orders up to remaining quantity', () => {
    const book = [restingSell(5, 100, '2026-01-01T00:00:00.000Z'), restingSell(5, 101, '2026-01-01T00:00:00.000Z')];
    const outcome = engine.match(aggressorBuy(8), book);

    expect(outcome.matches).toHaveLength(2);
    expect(outcome.matches[0].quantity).toBe(5n);
    expect(outcome.matches[1].quantity).toBe(3n);
    expect(outcome.remaining).toBe(0n);
  });

  it('reports remaining quantity when the book is insufficient', () => {
    const book = [restingSell(3, 100, '2026-01-01T00:00:00.000Z')];
    const outcome = engine.match(aggressorBuy(5), book);

    expect(outcome.matches).toHaveLength(1);
    expect(outcome.remaining).toBe(2n);
  });

  it('does not match a limit buy above resting sell prices that are too high', () => {
    const book = [restingSell(5, 120, '2026-01-01T00:00:00.000Z')];
    const outcome = engine.match(aggressorBuy(5, 'limit', 110), book);

    expect(outcome.matches).toHaveLength(0);
    expect(outcome.remaining).toBe(5n);
  });

  it('ignores cancelled and fully-fillled resting orders', () => {
    const cancelled = Order.reconstruct({
      id: OrderId.create('sell-cancelled'),
      tenantId,
      listingId,
      investorId: 'seller-1',
      side: 'sell' as OrderSide,
      orderType: 'limit' as OrderType,
      quantity: BigInt(10),
      limitPrice: Money.of(100n, 'USD'),
      filledQuantity: 0n,
      status: 'cancelled',
      placedAt: '2026-01-01T00:00:00.000Z',
      version: 2,
    });
    const outcome = engine.match(aggressorBuy(5), [cancelled]);

    expect(outcome.matches).toHaveLength(0);
    expect(outcome.remaining).toBe(5n);
  });
});
