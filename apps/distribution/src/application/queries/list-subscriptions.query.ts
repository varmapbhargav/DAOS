import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SUBSCRIPTION_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';
import { SubscriptionDto, toSubscriptionDto } from '../distribution.mapper';

export class ListSubscriptionsQuery {
  constructor(
    public readonly productId?: string,
    public readonly investorId?: string,
  ) {}
}

@QueryHandler(ListSubscriptionsQuery)
export class ListSubscriptionsHandler implements IQueryHandler<ListSubscriptionsQuery, SubscriptionDto[]> {
  constructor(@Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptions: SubscriptionRepository) {}

  async execute(query: ListSubscriptionsQuery): Promise<SubscriptionDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    let rows: SubscriptionDto[];
    if (query.investorId) {
      rows = (await this.subscriptions.findByInvestorId(tenantId, query.investorId)).map(toSubscriptionDto);
    } else if (query.productId) {
      rows = (await this.subscriptions.findByProductId(tenantId, query.productId)).map(toSubscriptionDto);
    } else {
      rows = (await this.subscriptions.findAll(tenantId)).map(toSubscriptionDto);
    }
    if (query.productId && query.investorId) {
      rows = rows.filter((s) => s.productId === query.productId && s.investorId === query.investorId);
    }
    return rows;
  }
}