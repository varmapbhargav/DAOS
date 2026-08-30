import { Injectable } from '@nestjs/common';

import { Order } from '../aggregates/order.aggregate';

export type MatchResult = {
  listingId: string;
  buyOrderId: string;
  sellOrderId: string;
  quantity: bigint;
  price: { amount: string; currency: string };
};

export type MatchOutcome = {
  matches: MatchResult[];
  remaining: bigint;
};

/**
 * Matches an aggressor order against resting opposite-side orders using
 * price-time priority. Buys prioritise the lowest resting sell price;
 * sells prioritise the highest resting buy price. Ties break by arrival time.
 */
@Injectable()
export class OrderMatchingEngine {
  match(order: Order, book: Order[]): MatchOutcome {
    if (order.openQuantity <= 0n) return { matches: [], remaining: 0n };
    const isBuy = order.side === 'buy';
    let remaining = order.openQuantity;
    const matches: MatchResult[] = [];

    const resting = book.filter(
      (o) => o.id.value !== order.id.value && o.side !== order.side && o.status !== 'cancelled' && o.openQuantity > 0n,
    );

    const candidates = resting.filter((o) => this.priceCompatible(o, order, isBuy));
    const sorted = [...candidates].sort((a, b) => {
      const priceDiff = this.priceOrder(a, b, isBuy);
      if (priceDiff !== 0) return priceDiff;
      return a.placedAt.localeCompare(b.placedAt);
    });

    for (const rest of sorted) {
      if (remaining <= 0n) break;
      const qty = remaining < rest.openQuantity ? remaining : rest.openQuantity;
      const price = rest.limitPrice ?? order.limitPrice;
      if (!price) continue;
      matches.push({
        listingId: order.listingId,
        buyOrderId: isBuy ? order.id.value : rest.id.value,
        sellOrderId: isBuy ? rest.id.value : order.id.value,
        quantity: qty,
        price: { amount: price.amount.toString(), currency: price.currency },
      });
      remaining -= qty;
    }

    return { matches, remaining };
  }

  private priceCompatible(rest: Order, aggressor: Order, isBuy: boolean): boolean {
    if (aggressor.orderType === 'market') return true;
    const aggrLimit = aggressor.limitPrice;
    const restLimit = rest.limitPrice;
    if (!aggrLimit || !restLimit) return false;
    return isBuy ? restLimit.amount <= aggrLimit.amount : restLimit.amount >= aggrLimit.amount;
  }

  private priceOrder(a: Order, b: Order, isBuy: boolean): number {
    const aP = a.limitPrice?.amount ?? 0n;
    const bP = b.limitPrice?.amount ?? 0n;
    const diff = isBuy ? aP - bP : bP - aP;
    return Number(diff);
  }
}
