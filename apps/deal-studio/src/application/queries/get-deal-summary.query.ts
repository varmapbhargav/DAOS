import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DealSummaryReadModel } from '../../infrastructure/persistence/entities/deal-summary-read-model.entity';

export class GetDealSummaryQuery {
  constructor(public readonly dealId: string) {}
}

@QueryHandler(GetDealSummaryQuery)
export class GetDealSummaryHandler implements IQueryHandler<GetDealSummaryQuery, any> {
  constructor(
    @InjectRepository(DealSummaryReadModel)
    private readonly readModel: Repository<DealSummaryReadModel>,
  ) {}

  async execute(query: GetDealSummaryQuery): Promise<any> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const summary = await this.readModel.findOne({
      where: { id: query.dealId, tenantId: tenantId.value },
    });
    if (!summary) throw new NotFoundError(`Deal not found: ${query.dealId}`);

    return {
      id: summary.id,
      name: summary.name,
      status: summary.status,
      version: summary.version,
      createdAt: summary.createdAt.toISOString(),
      updatedAt: summary.updatedAt.toISOString(),
    };
  }
}