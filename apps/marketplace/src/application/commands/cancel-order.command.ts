import { NotFoundError, OrderId, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ORDER_BOOK_CACHE, ORDER_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { OrderBookCache } from '../../infrastructure/cache/order-book.cache';

export class CancelOrderCommand {
  constructor(public readonly orderId: string) {}
}

@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand, { orderId: string; status: string }> {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(ORDER_BOOK_CACHE) private readonly book: OrderBookCache,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CancelOrderCommand): Promise<{ orderId: string; status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const order = await this.orders.findById(tenantId, OrderId.create(command.orderId));
    if (!order) throw new NotFoundError(`Order not found: ${command.orderId}`);
    order.cancel();
    await this.orders.save(order);
    await this.book.remove(command.orderId);
    await this.outbox.publish(order.pullEvents());
    return { orderId: order.id.value, status: order.status };
  }
}
