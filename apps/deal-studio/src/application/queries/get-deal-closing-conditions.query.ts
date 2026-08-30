import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DealId } from '@daos/shared-kernel';

import { DEAL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { DealDto, toDealDto } from '../deal.mapper';

export class GetDealClosingConditionsQuery {
  constructor(public readonly dealId: string) {}
}

@QueryHandler(GetDealClosingConditionsQuery)
export class GetDealClosingConditionsHandler implements IQueryHandler<GetDealClosingConditionsQuery, any> {
  constructor(@Inject(DEAL_REPOSITORY) private readonly deals: DealRepository) {}

  async execute(query: GetDealClosingConditionsQuery): Promise<any> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, DealId.create(query.dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${query.dealId}`);

    return {
      dealId: deal.id.value,
      closingConditions: deal.closingConditions.map((c) => ({
        conditionId: c.conditionId,
        description: c.description,
        category: c.category,
        responsibleParty: c.responsibleParty,
        dueDate: c.dueDate,
        status: c.status,
        metAt: c.metAt,
        verifiedBy: c.verifiedBy,
        verifiedAt: c.verifiedAt,
        evidence: c.evidence,
      })),
    };
  }
}