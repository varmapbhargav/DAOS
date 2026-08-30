import { ListingId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { LISTING_REPOSITORY, ORDER_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ListingRepository } from '../../domain/repositories/listing.repository';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { OrderBookDto, toOrderBookDto } from '../marketplace.mapper';

export class GetOrderBookQuery {
  constructor(public readonly listingId: string) {}
}

@QueryHandler(GetOrderBookQuery)
export class GetOrderBookHandler implements IQueryHandler<GetOrderBookQuery, OrderBookDto> {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(LISTING_REPOSITORY) private readonly listings: ListingRepository,
  ) {}

  async execute(query: GetOrderBookQuery): Promise<OrderBookDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const listing = await this.listings.findById(tenantId, ListingId.create(query.listingId));
    if (!listing) throw new NotFoundError(`Listing not found: ${query.listingId}`);
    const open = await this.orders.findOpenByListingId(tenantId, query.listingId);
    return toOrderBookDto(query.listingId, open);
  }
}
