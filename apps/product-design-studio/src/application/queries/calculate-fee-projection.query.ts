import { Money, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { InvestmentProductId } from '@daos/shared-kernel';

import { FeeModelCalculator } from '../../domain/services/fee-model-calculator';
import { FEE_MODEL_CALCULATOR, INVESTMENT_PRODUCT_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { InvestmentProductRepository } from '../../domain/repositories/investment-product.repository';
import { MoneyDto } from '../product.mapper';

export class CalculateFeeProjectionQuery {
  constructor(
    public readonly productId: string,
    public readonly grossAmountMinorUnits: string,
    public readonly currency: string,
  ) {}
}

export type FeeProjectionResult = {
  managementFee: MoneyDto;
  performanceFee: MoneyDto;
  carriedInterest: MoneyDto;
  netToInvestor: MoneyDto;
};

@QueryHandler(CalculateFeeProjectionQuery)
export class CalculateFeeProjectionHandler implements IQueryHandler<CalculateFeeProjectionQuery, FeeProjectionResult> {
  constructor(
    @Inject(INVESTMENT_PRODUCT_REPOSITORY) private readonly products: InvestmentProductRepository,
    @Inject(FEE_MODEL_CALCULATOR) private readonly calculator: FeeModelCalculator,
  ) {}

  async execute(query: CalculateFeeProjectionQuery): Promise<FeeProjectionResult> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const product = await this.products.findById(tenantId, InvestmentProductId.create(query.productId));
    if (!product) throw new NotFoundError(`Product not found: ${query.productId}`);

    const grossAmount = Money.of(BigInt(query.grossAmountMinorUnits), query.currency);
    const projection = this.calculator.calculate(grossAmount, product.feeStructure);

    return {
      managementFee: toMoneyDto(projection.managementFee),
      performanceFee: toMoneyDto(projection.performanceFee),
      carriedInterest: toMoneyDto(projection.carriedInterest),
      netToInvestor: toMoneyDto(projection.netToInvestor),
    };
  }
}

function toMoneyDto(money: Money): MoneyDto {
  return { amountMinorUnits: money.amount.toString(), currency: money.currency };
}
