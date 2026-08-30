import { NotFoundError, TenantContextHolder, TenantId, CorrelationId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DealId } from '@daos/shared-kernel';

import { DEAL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { DealDto, toDealDto } from '../deal.mapper';

export class GetDealQuery {
  constructor(public readonly dealId: string) {}
}

@QueryHandler(GetDealQuery)
export class GetDealHandler implements IQueryHandler<GetDealQuery, DealDto> {
  private readonly logger = new Logger(GetDealHandler.name);

  constructor(@Inject(DEAL_REPOSITORY) private readonly deals: DealRepository) {}

  async execute(query: GetDealQuery): Promise<DealDto> {
    const correlationId = CorrelationId.create();
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    this.logger.log(`Deal get | correlationId=${correlationId.value} | tenantId=${tenantId.value} | dealId=${query.dealId}`);
    const deal = await this.deals.findById(tenantId, DealId.create(query.dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${query.dealId}`);
    return toDealDto(deal);
  }
}
