import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DealSummaryReadModel } from '../../infrastructure/persistence/entities/deal-summary-read-model.entity';

export class PipelineDealsQuery {}

@QueryHandler(PipelineDealsQuery)
export class PipelineDealsHandler implements IQueryHandler<PipelineDealsQuery, Record<string, number>> {
  private readonly logger = new Logger(PipelineDealsHandler.name);

  constructor(
    @InjectRepository(DealSummaryReadModel)
    private readonly readModel: Repository<DealSummaryReadModel>,
  ) {}

  async execute(): Promise<Record<string, number>> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    this.logger.log(`Deal pipeline (read model) | tenantId=${tenantId.value}`);

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
      const count = await this.readModel.count({
        where: { tenantId: tenantId.value, status },
      });
      result[status] = count;
    }

    return result;
  }
}