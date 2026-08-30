import { ListingId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Order } from '../../domain/aggregates/order.aggregate';
import { CompliancePreTradeCheck } from '../../domain/services/compliance-pre-trade-check';
import {
  LISTING_REPOSITORY,
  ORDER_BOOK_CACHE,
  ORDER_REPOSITORY,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';
import { ListingRepository } from '../../domain/repositories/listing.repository';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { OrderBookCache } from '../../infrastructure/cache/order-book.cache';
import { PlaceOrderDto } from '../dto/marketplace.dto';
import { toMoney } from '../money.mapper';

export class PlaceOrderCommand {
  constructor(public readonly dto: PlaceOrderDto) {}
}

export interface PlaceOrderResult {
  orderId: string;
  status: string;
}

@CommandHandler(PlaceOrderCommand)
export class PlaceOrderHandler implements ICommandHandler<PlaceOrderCommand, PlaceOrderResult> {
  constructor(
    @Inject(LISTING_REPOSITORY) private readonly listings: ListingRepository,
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(ORDER_BOOK_CACHE) private readonly book: OrderBookCache,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
    private readonly compliance: CompliancePreTradeCheck,
  ) {}

  async execute(command: PlaceOrderCommand): Promise<PlaceOrderResult> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const listing = await this.listings.findById(tenantId, ListingId.create(command.dto.listingId));
    if (!listing) throw new NotFoundError(`Listing not found: ${command.dto.listingId}`);

    const quantity = BigInt(command.dto.quantity);
    const price = command.dto.limitPrice ?? { amount: '0', currency: listing.currency };
    const check = this.compliance.check({
      listing,
      quantity,
      price,
      investorRisk: { kycApproved: true, isAccredited: true },
    });
    if (!check.allowed) throw new Error(`Order rejected: ${check.reasons.join(', ')}`);

    const order = Order.place({
      tenantId,
      listingId: command.dto.listingId,
      investorId: command.dto.investorId,
      side: command.dto.side,
      orderType: command.dto.orderType as Order['orderType'],
      quantity,
      limitPrice: command.dto.limitPrice ? toMoney(command.dto.limitPrice) : null,
    });
    await this.orders.save(order);
    await this.book.add(order);
    await this.outbox.publish(order.pullEvents());
    return { orderId: order.id.value, status: order.status };
  }
}
