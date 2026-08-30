import { OutboxPublisher, PriceId, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Price } from '../../domain/aggregates/price.aggregate';
import { PriceHistoryRepository } from '../../domain/repositories/price-history.repository';
import { PriceRepository } from '../../domain/repositories/price.repository';
import { OUTBOX_PUBLISHER, PRICE_HISTORY_REPOSITORY, PRICE_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { PublishPriceDto } from '../dto/pricing.dto';
import { toMoney } from '../money.mapper';

export class PublishPriceCommand {
  constructor(public readonly dto: PublishPriceDto) {}
}

@CommandHandler(PublishPriceCommand)
export class PublishPriceHandler implements ICommandHandler<PublishPriceCommand, { priceId: string }> {
  constructor(
    @Inject(PRICE_REPOSITORY) private readonly prices: PriceRepository,
    @Inject(PRICE_HISTORY_REPOSITORY) private readonly history: PriceHistoryRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: PublishPriceCommand): Promise<{ priceId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const dto = command.dto;
    const existing = await this.prices.findByIsin(tenantId, dto.isin);

    let price: Price;
    if (existing) {
      existing.updatePrice({
        price: toMoney({ amount: dto.amount, currency: dto.currency }),
        source: dto.source as Price['source'],
        fairValueHierarchy: dto.fairValueHierarchy as Price['fairValueHierarchy'],
        marketDate: dto.marketDate,
      });
      price = existing;
    } else {
      price = Price.publish({
        tenantId,
        isin: dto.isin,
        price: toMoney({ amount: dto.amount, currency: dto.currency }),
        source: dto.source as Price['source'],
        fairValueHierarchy: dto.fairValueHierarchy as Price['fairValueHierarchy'],
        marketDate: dto.marketDate,
      });
    }

    await this.history.append({
      tenantId: tenantId.value,
      instrumentId: price.id.value,
      isin: price.isin,
      currency: price.price.currency,
      price: price.price.amount.toString(),
      timestamp: dto.marketDate,
    });
    await this.prices.save(price);
    await this.outbox.publish(price.pullEvents());
    return { priceId: price.id.value };
  }
}
