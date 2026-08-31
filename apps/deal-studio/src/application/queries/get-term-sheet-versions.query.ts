import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DealId } from '@daos/shared-kernel';

import { DEAL_REPOSITORY, TERM_SHEET_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { TermSheetRepository } from '../../domain/repositories/term-sheet.repository';
import { TermSheetDto, toTermSheetDto } from '../deal.mapper';

export class GetTermSheetVersionsQuery {
  constructor(public readonly dealId: string) {}
}

@QueryHandler(GetTermSheetVersionsQuery)
export class GetTermSheetVersionsHandler implements IQueryHandler<GetTermSheetVersionsQuery, any> {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly deals: DealRepository,
    @Inject(TERM_SHEET_REPOSITORY) private readonly termSheets: TermSheetRepository,
  ) {}

  async execute(query: GetTermSheetVersionsQuery): Promise<any> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, DealId.create(query.dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${query.dealId}`);

    const termSheet = await this.termSheets.findByDealId(tenantId, deal.id.value);
    if (!termSheet) return [];

    return termSheet.versions.map((v) => ({
      id: v.versionId,
      versionNumber: v.versionNumber,
      status: v.status,
      createdAt: v.createdAt,
      amendmentReason: v.amendmentReason,
    }));
  }
}