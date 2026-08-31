import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DealId } from '@daos/shared-kernel';

import { DEAL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { DealDto, toDealDto } from '../deal.mapper';

export class GetDealEconomicsQuery {
  constructor(public readonly dealId: string) {}
}

@QueryHandler(GetDealEconomicsQuery)
export class GetDealEconomicsHandler implements IQueryHandler<GetDealEconomicsQuery, any> {
  constructor(@Inject(DEAL_REPOSITORY) private readonly deals: DealRepository) {}

  async execute(query: GetDealEconomicsQuery): Promise<any> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, DealId.create(query.dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${query.dealId}`);

    const economics = deal.economics;
    if (!economics) return null;

    return {
      acquisitionPrice: economics.acquisitionPrice
        ? {
            amountMinorUnits: economics.acquisitionPrice.amount.toString(),
            currency: economics.acquisitionPrice.currency,
          }
        : null,
      enterpriseValue: economics.enterpriseValue
        ? {
            amountMinorUnits: economics.enterpriseValue.amount.toString(),
            currency: economics.enterpriseValue.currency,
          }
        : null,
      equityValue: economics.equityValue
        ? {
            amountMinorUnits: economics.equityValue.amount.toString(),
            currency: economics.equityValue.currency,
          }
        : null,
      totalCapitalization: economics.totalCapitalization
        ? {
            amountMinorUnits: economics.totalCapitalization.amount.toString(),
            currency: economics.totalCapitalization.currency,
          }
        : null,
      fees: economics.fees
        ? {
            amountMinorUnits: economics.fees.amount.toString(),
            currency: economics.fees.currency,
          }
        : null,
      expenses: economics.expenses
        ? {
            amountMinorUnits: economics.expenses.amount.toString(),
            currency: economics.expenses.currency,
          }
        : null,
      targetIrr: economics.targetIrr?.toFraction() ?? null,
      targetMoic: economics.targetMoic ?? null,
      expectedYield: economics.expectedYield?.toFraction() ?? null,
    };
  }
}