import { NotFoundError, OrderId, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ORDER_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { OrderDto, toOrderDto } from '../marketplace.mapper';

export class GetOrderQuery {
  constructor(public readonly orderId: string) {}
}

@QueryHandler(GetOrderQuery)
export class GetOrderHandler implements IQueryHandler<GetOrderQuery, OrderDto> {
  constructor(@Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository) {}

  async execute(query: GetOrderQuery): Promise<OrderDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const order = await this.orders.findById(tenantId, OrderId.create(query.orderId));
    if (!order) throw new NotFoundError(`Order not found: ${query.orderId}`);
    return toOrderDto(order);
  }
}
