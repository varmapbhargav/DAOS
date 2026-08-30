import { NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { InvestmentProductId } from '@daos/shared-kernel';

import { INVESTMENT_PRODUCT_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { InvestmentProductRepository } from '../../domain/repositories/investment-product.repository';

export class ApproveProductCommand {
  constructor(
    public readonly productId: string,
    public readonly approvedBy: string,
  ) {}
}

@CommandHandler(ApproveProductCommand)
export class ApproveProductHandler implements ICommandHandler<ApproveProductCommand, { status: string }> {
  constructor(
    @Inject(INVESTMENT_PRODUCT_REPOSITORY) private readonly products: InvestmentProductRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ApproveProductCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const product = await this.products.findById(tenantId, InvestmentProductId.create(command.productId));
    if (!product) throw new NotFoundError(`Product not found: ${command.productId}`);

    product.approve(command.approvedBy);

    await this.products.save(product);
    await this.outbox.publish(product.pullEvents());
    return { status: product.status };
  }
}
