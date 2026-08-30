import { Money, NotFoundError, OrderId, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Order } from '../../domain/aggregates/order.aggregate';
import { Trade } from '../../domain/aggregates/trade.aggregate';
import { OrderMatchingEngine } from '../../domain/services/order-matching-engine';
import {
  ORDER_BOOK_CACHE,
  ORDER_REPOSITORY,
  OUTBOX_PUBLISHER,
  TRADE_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { TradeRepository } from '../../domain/repositories/trade.repository';
import { OrderBookCache } from '../../infrastructure/cache/order-book.cache';

export class ExecuteTradeCommand {
  constructor(public readonly orderId: string) {}
}

export interface ExecuteTradeResult {
  tradeIds: string[];
  executedQuantity: string;
}

@CommandHandler(ExecuteTradeCommand)
export class ExecuteTradeHandler implements ICommandHandler<ExecuteTradeCommand, ExecuteTradeResult> {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(TRADE_REPOSITORY) private readonly trades: TradeRepository,
    @Inject(ORDER_BOOK_CACHE) private readonly book: OrderBookCache,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
    private readonly engine: OrderMatchingEngine,
  ) {}

  async execute(command: ExecuteTradeCommand): Promise<ExecuteTradeResult> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const aggressor = await this.orders.findById(tenantId, OrderId.create(command.orderId));
    if (!aggressor) throw new NotFoundError(`Order not found: ${command.orderId}`);
    if (aggressor.openQuantity <= 0n) return { tradeIds: [], executedQuantity: '0' };

    const book = await this.orders.findOpenByListingId(tenantId, aggressor.listingId);
    const outcome = this.engine.match(aggressor, book);

    const tradeIds: string[] = [];
    let executedQuantity = 0n;
    const ordersToSave: Order[] = [];

    for (const match of outcome.matches) {
      const price = Money.of(BigInt(match.price.amount), match.price.currency);
      const trade = Trade.execute({
        tenantId,
        listingId: aggressor.listingId,
        buyOrderId: match.buyOrderId,
        sellOrderId: match.sellOrderId,
        quantity: match.quantity,
        price,
      });
      await this.trades.save(trade);
      await this.outbox.publish(trade.pullEvents());
      tradeIds.push(trade.id.value);
      executedQuantity += match.quantity;

      const fill = { quantity: match.quantity, price, tradeId: trade.id.value };
      const buyer = this.resolveOrder(match.buyOrderId, aggressor, book);
      const seller = this.resolveOrder(match.sellOrderId, aggressor, book);
      if (buyer) {
        buyer.applyFill(fill);
        ordersToSave.push(buyer);
      }
      if (seller) {
        seller.applyFill(fill);
        ordersToSave.push(seller);
      }
    }

    for (const order of ordersToSave) {
      if (order.id.value === aggressor.id.value) continue;
      await this.orders.save(order);
      await this.outbox.publish(order.pullEvents());
    }
    await this.orders.save(aggressor);
    await this.outbox.publish(aggressor.pullEvents());

    if (outcome.remaining > 0n) {
      await this.book.add(aggressor);
    } else {
      await this.book.remove(aggressor.id.value);
    }

    return { tradeIds, executedQuantity: executedQuantity.toString() };
  }

  private resolveOrder(orderId: string, aggressor: Order, book: Order[]): Order | null {
    if (aggressor.id.value === orderId) return aggressor;
    return book.find((o) => o.id.value === orderId) ?? null;
  }
}
