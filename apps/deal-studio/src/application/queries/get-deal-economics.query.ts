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
      acquisitionPrice: economics.data.acquisitionPrice
        ? {
            amountMinorUnits: economics.data.acquisitionPrice.amount.toString(),
            currency: economics.data.acquisitionPrice.currency,
          }
        : null,
      enterpriseValue: economics.data.enterpriseValue
        ? {
            amountMinorUnits: economics.data.enterpriseValue.amount.toString(),
            currency: economics.data.enterpriseValue.currency,
          }
        : null,
      equityValue: economics.data.equityValue
        ? {
            amountMinorUnits: economics.data.equityValue.amount.toString(),
            currency: economics.data.equityValue.currency,
          }
        : null,
      totalCapitalization: economics.data.totalCapitalization
        ? {
            amountMinorUnits: economics.data.totalCapitalization.amount.toString(),
            currency: economics.data.totalCapitalization.currency,
          }
        : null,
      fees: economics.data.fees
        ? {
            amountMinorUnits: economics.data.fees.amount.toString(),
            currency: economics.data.fees.currency,
          }
        : null,
      expenses: economics.data.expenses
        ? {
            amountMinorUnits: economics.data.expenses.amount.toString(),
            currency: economics.data.expenses.currency,
          }
        : null,
      targetIrr: economics.data.targetIrr?.toFraction() ?? null,
      targetMoic: economics.data.targetMoic ?? null,
      expectedYield: economics.data.expectedYield?.toFraction() ?? null,
    };
  }
}