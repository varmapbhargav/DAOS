import { NotFoundError, OutboxPublisher, PriceId, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OUTBOX_PUBLISHER, PRICE_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { PriceRepository } from '../../domain/repositories/price.repository';

export class MarkPriceStaleCommand {
  constructor(public readonly priceId: string) {}
}

@CommandHandler(MarkPriceStaleCommand)
export class MarkPriceStaleHandler implements ICommandHandler<MarkPriceStaleCommand, { priceId: string }> {
  constructor(
    @Inject(PRICE_REPOSITORY) private readonly prices: PriceRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: MarkPriceStaleCommand): Promise<{ priceId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const price = await this.prices.findById(tenantId, PriceId.create(command.priceId));
    if (!price) throw new NotFoundError(`Price not found: ${command.priceId}`);
    price.markStale();
    await this.prices.save(price);
    await this.outbox.publish(price.pullEvents());
    return { priceId: price.id.value };
  }
}
