import { Money, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  CAPITAL_CALL_REPOSITORY,
  SUBSCRIPTION_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';
import { CapitalCallRepository } from '../../domain/repositories/capital-call.repository';
import { FundraisingProgressDto, toFundraisingProgressDto } from '../distribution.mapper';

export class GetFundraisingProgressQuery {
  constructor(public readonly productId: string) {}
}

@QueryHandler(GetFundraisingProgressQuery)
export class GetFundraisingProgressHandler implements IQueryHandler<GetFundraisingProgressQuery, FundraisingProgressDto> {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptions: SubscriptionRepository,
    @Inject(CAPITAL_CALL_REPOSITORY) private readonly capitalCalls: CapitalCallRepository,
  ) {}

  async execute(query: GetFundraisingProgressQuery): Promise<FundraisingProgressDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const subscriptions = await this.subscriptions.findByProductId(tenantId, query.productId);

    let allocated = Money.zero('USD');
    for (const s of subscriptions) {
      if (s.allocatedAmount) allocated = allocated.add(s.allocatedAmount);
    }
    let funded = Money.zero('USD');
    for (const s of subscriptions) {
      if (s.status === 'funded' && s.allocatedAmount) funded = funded.add(s.allocatedAmount);
    }
    return toFundraisingProgressDto({ productId: query.productId, subscriptions, accumulated: { allocated, funded } });
  }
}