import { TenantContextHolder, TenantId, CorrelationId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
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

    // Build filter conditions
    const conditions: any[] = [];

    if (query.status) {
      conditions.push({ status: query.status });
    }
    if (query.name) {
      conditions.push({ name: { contains: query.name } });
    }
    if (query.referenceNumber) {
      conditions.push({ referenceNumber: { equals: query.referenceNumber } });
    }
    if (query.assetId) {
      conditions.push({ assetId: { equals: query.assetId } });
    }
    if (query.sponsorId) {
      conditions.push({ sponsorId: { equals: query.sponsorId } });
    }
    if (query.dealType) {
      conditions.push({ 'metadata.dealType': query.dealType });
    }
    if (query.assetClass) {
      conditions.push({ 'metadata.assetClass': query.assetClass });
    }
    if (query.jurisdiction) {
      conditions.push({ 'metadata.jurisdiction': query.jurisdiction });
    }
    if (query.currency) {
      conditions.push({ 'metadata.currency': query.currency });
    }
    if (query.ownerId) {
      conditions.push({ 'metadata.dealOwnerId': { equals: query.ownerId } });
    }
    if (query.dateFrom || query.dateTo) {
      const dateCondition: any = {};
      if (query.dateFrom) dateCondition.gte = query.dateFrom;
      if (query.dateTo) dateCondition.lte = query.dateTo;
      conditions.push({ created_at: dateCondition });
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    const list = await this.deals.findAll(tenantId, where);
    return list.map(toDealDto);
  }
}