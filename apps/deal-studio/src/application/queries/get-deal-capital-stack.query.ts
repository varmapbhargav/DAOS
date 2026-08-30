import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DealId } from '@daos/shared-kernel';

import { DEAL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { DealDto, toDealDto } from '../deal.mapper';

export class GetDealCapitalStackQuery {
  constructor(public readonly dealId: string) {}
}

@QueryHandler(GetDealCapitalStackQuery)
export class GetDealCapitalStackHandler implements IQueryHandler<GetDealCapitalStackQuery, any> {
  constructor(@Inject(DEAL_REPOSITORY) private readonly deals: DealRepository) {}

  async execute(query: GetDealCapitalStackQuery): Promise<any> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, DealId.create(query.dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${query.dealId}`);

    if (!deal.capitalStack) return null;

    return {
      tranches: deal.capitalStack.tranches.map((t) => ({
        trancheId: t.trancheId,
        name: t.name,
        type: t.type,
        currency: t.currency,
        targetAmount: {
          amountMinorUnits: t.targetAmount.amount.toString(),
          currency: t.targetAmount.currency,
        },
        committedAmount: t.committedAmount?.amount?.toString() ?? null,
        fundedAmount: t.fundedAmount?.amount?.toString() ?? null,
        seniority: t.seniority,
        ranking: t.ranking,
        economics: t.economics,
      })),
    };
  }
}