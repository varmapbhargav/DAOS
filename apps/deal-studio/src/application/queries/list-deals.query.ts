import { TenantContextHolder, TenantId, CorrelationId } from '@daos/shared-kernel';
import { Inject, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DEAL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { DealDto, toDealDto } from '../deal.mapper';

export class ListDealsQuery {
  constructor(
    public readonly status?: string,
    public readonly name?: string,
    public readonly referenceNumber?: string,
    public readonly assetId?: string,
    public readonly sponsorId?: string,
    public readonly dealType?: string,
    public readonly assetClass?: string,
    public readonly jurisdiction?: string,
    public readonly currency?: string,
    public readonly ownerId?: string,
    public readonly dateFrom?: string,
    public readonly dateTo?: string,
  ) {}
}

@QueryHandler(ListDealsQuery)
export class ListDealsHandler implements IQueryHandler<ListDealsQuery, DealDto[]> {
  private readonly logger = new Logger(ListDealsHandler.name);

  constructor(@Inject(DEAL_REPOSITORY) private readonly deals: DealRepository) {}

  async execute(query: ListDealsQuery): Promise<DealDto[]> {
    const correlationId = CorrelationId.create();
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    this.logger.log(`Deal list | correlationId=${correlationId.value} | tenantId=${tenantId.value} | status=${query.status}`);

    const filter = {
      name: query.name,
      status: query.status,
      assetId: query.assetId,
      sponsorId: query.sponsorId,
      dealType: query.dealType,
      assetClass: query.assetClass,
      jurisdiction: query.jurisdiction,
      currency: query.currency,
      ownerId: query.ownerId,
      createdAt: query.dateFrom || query.dateTo ? { gte: query.dateFrom, lte: query.dateTo } : undefined,
    };

    const list = await this.deals.findAll(tenantId, filter);
    return list.map(toDealDto);
  }
}