import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ORDER_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { OrderDto, toOrderDto } from '../marketplace.mapper';

export class ListOrdersQuery {
  constructor(
    public readonly listingId?: string,
    public readonly investorId?: string,
  ) {}
}

@QueryHandler(ListOrdersQuery)
export class ListOrdersHandler implements IQueryHandler<ListOrdersQuery, OrderDto[]> {
  constructor(@Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository) {}

  async execute(query: ListOrdersQuery): Promise<OrderDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    let rows: OrderDto[];
    if (query.investorId) {
      rows = (await this.orders.findByInvestorId(tenantId, query.investorId)).map(toOrderDto);
    } else if (query.listingId) {
      rows = (await this.orders.findByListingId(tenantId, query.listingId)).map(toOrderDto);
    } else {
      rows = (await this.orders.findAll(tenantId)).map(toOrderDto);
    }
    return rows;
  }
}
