import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DealSummaryReadModel } from '../../infrastructure/persistence/entities/deal-summary-read-model.entity';

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
export class ListDealsHandler implements IQueryHandler<ListDealsQuery, DealSummaryReadModel[]> {
  private readonly logger = new Logger(ListDealsHandler.name);

  constructor(
    @InjectRepository(DealSummaryReadModel)
    private readonly readModel: Repository<DealSummaryReadModel>,
  ) {}

  async execute(query: ListDealsQuery): Promise<DealSummaryReadModel[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    this.logger.log(`Deal list (read model) | tenantId=${tenantId.value} | status=${query.status}`);

    const qb = this.readModel
      .createQueryBuilder('d')
      .andWhere('d.tenant_id = :tid', { tid: tenantId.value });

    if (query.status) qb.andWhere('d.status = :status', { status: query.status });
    if (query.name) qb.andWhere('d.name ILIKE :name', { name: `%${query.name}%` });
    if (query.assetId) qb.andWhere('d.asset_id = :assetId', { assetId: query.assetId });
    if (query.sponsorId) qb.andWhere('d.sponsor_id = :sponsorId', { sponsorId: query.sponsorId });
    if (query.dealType) qb.andWhere(`d.metadata->>'dealType' = :dealType`, { dealType: query.dealType });
    if (query.assetClass) qb.andWhere(`d.metadata->>'assetClass' = :assetClass`, { assetClass: query.assetClass });
    if (query.jurisdiction) qb.andWhere(`d.metadata->>'jurisdiction' = :jurisdiction`, { jurisdiction: query.jurisdiction });
    if (query.currency) qb.andWhere(`d.metadata->>'currency' = :currency`, { currency: query.currency });
    if (query.ownerId) qb.andWhere(`d.metadata->>'dealOwnerId' = :ownerId`, { ownerId: query.ownerId });
    if (query.dateFrom) qb.andWhere('d.created_at >= :from', { from: query.dateFrom });
    if (query.dateTo) qb.andWhere('d.created_at <= :to', { to: query.dateTo });

    return qb.orderBy('d.created_at', 'DESC').getMany();
  }
}