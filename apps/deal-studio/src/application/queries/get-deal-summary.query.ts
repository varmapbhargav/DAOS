import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DealId } from '@daos/shared-kernel';

import { DEAL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { DealDto, toDealDto } from '../deal.mapper';

export class GetDealSummaryQuery {
  constructor(public readonly dealId: string) {}
}

@QueryHandler(GetDealSummaryQuery)
export class GetDealSummaryHandler implements IQueryHandler<GetDealSummaryQuery, any> {
  constructor(@Inject(DEAL_REPOSITORY) private readonly deals: DealRepository) {}

  async execute(query: GetDealSummaryQuery): Promise<any> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, DealId.create(query.dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${query.dealId}`);

    return {
      id: deal.id.value,
      name: deal.name,
      status: deal.status,
      version: deal.version,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}