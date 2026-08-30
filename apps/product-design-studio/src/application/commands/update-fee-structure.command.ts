import { FeeStructure, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { InvestmentProductId } from '@daos/shared-kernel';

import { INVESTMENT_PRODUCT_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { InvestmentProductRepository } from '../../domain/repositories/investment-product.repository';
import { UpdateFeeStructureDto } from '../dto/product-action.dto';

export class UpdateFeeStructureCommand {
  constructor(
    public readonly productId: string,
    public readonly dto: UpdateFeeStructureDto,
  ) {}
}

@CommandHandler(UpdateFeeStructureCommand)
export class UpdateFeeStructureHandler implements ICommandHandler<UpdateFeeStructureCommand, { status: string }> {
  constructor(
    @Inject(INVESTMENT_PRODUCT_REPOSITORY) private readonly products: InvestmentProductRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: UpdateFeeStructureCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const product = await this.products.findById(tenantId, InvestmentProductId.create(command.productId));
    if (!product) throw new NotFoundError(`Product not found: ${command.productId}`);

    const feeStructure: FeeStructure = {
      managementFeeAnnual: command.dto.managementFeeAnnual,
      performanceFee: command.dto.performanceFee,
      hurdleRate: command.dto.hurdleRate,
      highWaterMark: command.dto.highWaterMark ?? true,
      catchUpPercentage: command.dto.catchUpPercentage,
      catchUpRate: command.dto.catchUpRate,
    };
    product.updateFeeStructure(feeStructure);
    product.approveFeeStructure();

    await this.products.save(product);
    await this.outbox.publish(product.pullEvents());
    return { status: product.status };
  }
}
