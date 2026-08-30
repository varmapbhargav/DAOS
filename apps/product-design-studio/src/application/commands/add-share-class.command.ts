import { DomainEvent, Money, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { InvestmentProductId } from '@daos/shared-kernel';

import { ShareClass } from '../../domain/entities/share-class.aggregate';
import {
  INVESTMENT_PRODUCT_REPOSITORY,
  SHARE_CLASS_REPOSITORY,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';
import { InvestmentProductRepository } from '../../domain/repositories/investment-product.repository';
import { ShareClassRepository } from '../../domain/repositories/share-class.repository';
import { AddShareClassDto } from '../dto/product-action.dto';

export class AddShareClassCommand {
  constructor(
    public readonly productId: string,
    public readonly dto: AddShareClassDto,
  ) {}
}

@CommandHandler(AddShareClassCommand)
export class AddShareClassHandler implements ICommandHandler<AddShareClassCommand, { shareClassId: string }> {
  constructor(
    @Inject(INVESTMENT_PRODUCT_REPOSITORY) private readonly products: InvestmentProductRepository,
    @Inject(SHARE_CLASS_REPOSITORY) private readonly shareClasses: ShareClassRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: AddShareClassCommand): Promise<{ shareClassId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const product = await this.products.findById(tenantId, InvestmentProductId.create(command.productId));
    if (!product) throw new NotFoundError(`Product not found: ${command.productId}`);

    const currency = command.dto.currency;
    const shareClass = ShareClass.create({
      tenantId,
      productId: product.id.value,
      name: command.dto.name,
      currency,
      targetSize: Money.of(BigInt(command.dto.targetSizeMinorUnits), currency),
      minInvestment: Money.of(BigInt(command.dto.minInvestmentMinorUnits), currency),
      maxInvestors: command.dto.maxInvestors,
    });

    product.addShareClass(shareClass.id.value);

    const events: DomainEvent[] = [...shareClass.pullEvents(), ...product.pullEvents()];

    await this.shareClasses.save(shareClass);
    await this.products.save(product);
    await this.outbox.publish(events);
    return { shareClassId: shareClass.id.value };
  }
}
