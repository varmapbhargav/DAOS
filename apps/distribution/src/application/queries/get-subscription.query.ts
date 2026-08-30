import { NotFoundError, SubscriptionId, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SUBSCRIPTION_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';
import { SubscriptionDto, toSubscriptionDto } from '../distribution.mapper';

export class GetSubscriptionQuery {
  constructor(public readonly subscriptionId: string) {}
}

@QueryHandler(GetSubscriptionQuery)
export class GetSubscriptionHandler implements IQueryHandler<GetSubscriptionQuery, SubscriptionDto> {
  constructor(@Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptions: SubscriptionRepository) {}

  async execute(query: GetSubscriptionQuery): Promise<SubscriptionDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const subscription = await this.subscriptions.findById(tenantId, SubscriptionId.create(query.subscriptionId));
    if (!subscription) throw new NotFoundError(`Subscription not found: ${query.subscriptionId}`);
    return toSubscriptionDto(subscription);
  }
}