import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DealId } from '@daos/shared-kernel';

import { DEAL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { DealDto, toDealDto } from '../deal.mapper';

export class GetDealWaterfallQuery {
  constructor(public readonly dealId: string) {}
}

@QueryHandler(GetDealWaterfallQuery)
export class GetDealWaterfallHandler implements IQueryHandler<GetDealWaterfallQuery, any> {
  constructor(@Inject(DEAL_REPOSITORY) private readonly deals: DealRepository) {}

  async execute(query: GetDealWaterfallQuery): Promise<any> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, DealId.create(query.dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${query.dealId}`);

    // Return waterfall distribution data from the deal's distribution
    const distribution = deal.distribution || null;

    return {
      dealId: deal.id.value,
      distributions: distribution
        ? distribution.distributions.map((d) => ({
            priority: d.priority,
            recipient: d.recipient,
            distributionType: d.distributionType,
            thresholdAmount: d.thresholdAmount
              ? {
                  amountMinorUnits: d.thresholdAmount.amount.toString(),
                  currency: d.thresholdAmount.currency,
                }
              : null,
            hurdleRate: d.hurdleRate?.toFraction() ?? null,
            allocationPercentage: d.allocationPercentage,
            catchUpApplies: d.catchUpApplies,
            catchUpPercentage: d.catchUpPercentage ?? null,
          }))
        : [],
    };
  }
}