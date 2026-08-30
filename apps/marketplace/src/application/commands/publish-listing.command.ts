import { Money, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Listing } from '../../domain/aggregates/listing.aggregate';
import { LISTING_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { ListingRepository } from '../../domain/repositories/listing.repository';
import { PublishListingDto } from '../dto/marketplace.dto';
import { toMoney } from '../money.mapper';

export class PublishListingCommand {
  constructor(public readonly dto: PublishListingDto) {}
}

@CommandHandler(PublishListingCommand)
export class PublishListingHandler implements ICommandHandler<PublishListingCommand, { listingId: string }> {
  constructor(
    @Inject(LISTING_REPOSITORY) private readonly listings: ListingRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: PublishListingCommand): Promise<{ listingId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const listing = Listing.publish({
      tenantId,
      productId: command.dto.productId,
      issueId: command.dto.issueId ?? null,
      listingType: command.dto.listingType,
      mechanism: command.dto.mechanism as Listing['mechanism'],
      currency: command.dto.currency,
      totalQuantity: BigInt(command.dto.totalQuantity),
      minimumQuantity: BigInt(command.dto.minimumQuantity),
      referencePrice: command.dto.referencePrice ? toMoney(command.dto.referencePrice) : null,
      session: command.dto.session ?? { openAt: '09:00', closeAt: '17:00', timezone: 'UTC' },
    });
    await this.listings.save(listing);
    await this.outbox.publish(listing.pullEvents());
    return { listingId: listing.id.value };
  }
}
