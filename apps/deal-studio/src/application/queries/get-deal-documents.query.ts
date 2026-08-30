import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DealId } from '@daos/shared-kernel';

import { DEAL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { DealDto, toDealDto } from '../deal.mapper';

export class GetDealDocumentsQuery {
  constructor(public readonly dealId: string) {}
}

@QueryHandler(GetDealDocumentsQuery)
export class GetDealDocumentsHandler implements IQueryHandler<GetDealDocumentsQuery, any> {
  constructor(@Inject(DEAL_REPOSITORY) private readonly deals: DealRepository) {}

  async execute(query: GetDealDocumentsQuery): Promise<any> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, DealId.create(query.dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${query.dealId}`);

    return {
      dealId: deal.id.value,
      documents: deal.documents.map((d) => ({
        documentId: d.documentId,
        externalStorageRef: d.externalStorageRef,
        category: d.category,
        title: d.title,
        status: d.status,
        uploadedBy: d.uploadedBy,
        uploadedAt: d.uploadedAt,
      })),
    };
  }
}