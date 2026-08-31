import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DealId } from '@daos/shared-kernel';

import { DEAL_REPOSITORY, DISTRIBUTION_WATERFALL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { DistributionWaterfallRepository } from '../../domain/repositories/distribution-waterfall.repository';

export class GetDealWaterfallQuery {
  constructor(public readonly dealId: string) {}
}

@QueryHandler(GetDealWaterfallQuery)
export class GetDealWaterfallHandler implements IQueryHandler<GetDealWaterfallQuery, any> {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly deals: DealRepository,
    @Inject(DISTRIBUTION_WATERFALL_REPOSITORY) private readonly waterfallRepo: DistributionWaterfallRepository,
  ) {}

  async execute(query: GetDealWaterfallQuery): Promise<any> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, DealId.create(query.dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${query.dealId}`);

    const distribution = await this.waterfallRepo.findByDealId(tenantId, deal.id.value);

    return {
      dealId: deal.id.value,
      tiers: distribution
        ? distribution.tiers.map((d) => ({
            tierId: d.tierId,
            priority: d.priority,
            recipient: d.recipient,
            distributionType: d.distributionType,
            thresholdAmount: d.thresholdAmount
              ? {
                  amountMinorUnits: d.thresholdAmount.amount.toString(),
                  currency: d.thresholdAmount.currency,
                }
              : null,
            hurdleRate: d.hurdleRate ?? null,
            allocationPercentage: d.allocationPercentage,
            catchUpApplies: d.catchUpApplies,
            catchUpPercentage: d.catchUpPercentage ?? null,
          }))
        : [],
    };
  }
}
