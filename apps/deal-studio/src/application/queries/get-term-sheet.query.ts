import { DealId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DEAL_REPOSITORY, TERM_SHEET_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { TermSheetRepository } from '../../domain/repositories/term-sheet.repository';
import { TermSheetDto, toTermSheetDto } from '../deal.mapper';

export class GetTermSheetQuery {
  constructor(public readonly dealId: string) {}
}

@QueryHandler(GetTermSheetQuery)
export class GetTermSheetHandler implements IQueryHandler<GetTermSheetQuery, TermSheetDto> {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly deals: DealRepository,
    @Inject(TERM_SHEET_REPOSITORY) private readonly termSheets: TermSheetRepository,
  ) {}

  async execute(query: GetTermSheetQuery): Promise<TermSheetDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, DealId.create(query.dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${query.dealId}`);
    const termSheet = await this.termSheets.findByDealId(tenantId, deal.id.value);
    if (!termSheet) throw new NotFoundError(`Term sheet not found for deal: ${query.dealId}`);
    return toTermSheetDto(termSheet);
  }
}
