import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DEAL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';

export class PipelineDealsQuery {}

@QueryHandler(PipelineDealsQuery)
export class PipelineDealsHandler implements IQueryHandler<PipelineDealsQuery, Record<string, number>> {
  constructor(@Inject(DEAL_REPOSITORY) private readonly deals: DealRepository) {}

  async execute(): Promise<Record<string, number>> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const statuses = [
      'DRAFT',
      'STRUCTURING',
      'LEGAL_REVIEW',
      'APPROVAL',
      'CLOSING',
      'CLOSED',
      'ON_HOLD',
      'REJECTED',
      'CANCELLED',
      'EXPIRED',
    ];

    const result: Record<string, number> = {};
    for (const status of statuses) {
      const count = await this.deals.countByStatus(tenantId);
      result[status] = count[status] || 0;
    }

    return result;
  }
}