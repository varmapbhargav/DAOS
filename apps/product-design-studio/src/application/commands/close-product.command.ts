import { NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { InvestmentProductId } from '@daos/shared-kernel';

import { INVESTMENT_PRODUCT_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { InvestmentProductRepository } from '../../domain/repositories/investment-product.repository';

export class CloseProductCommand {
  constructor(public readonly productId: string) {}
}

@CommandHandler(CloseProductCommand)
export class CloseProductHandler implements ICommandHandler<CloseProductCommand, { status: string }> {
  constructor(
    @Inject(INVESTMENT_PRODUCT_REPOSITORY) private readonly products: InvestmentProductRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CloseProductCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const product = await this.products.findById(tenantId, InvestmentProductId.create(command.productId));
    if (!product) throw new NotFoundError(`Product not found: ${command.productId}`);

    product.close();

    await this.products.save(product);
    await this.outbox.publish(product.pullEvents());
    return { status: product.status };
  }
}
