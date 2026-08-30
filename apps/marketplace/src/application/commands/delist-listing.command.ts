import { ListingId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LISTING_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { ListingRepository } from '../../domain/repositories/listing.repository';
import { DelistListingDto } from '../dto/marketplace.dto';

export class DelistListingCommand {
  constructor(
    public readonly listingId: string,
    public readonly dto: DelistListingDto,
  ) {}
}

@CommandHandler(DelistListingCommand)
export class DelistListingHandler implements ICommandHandler<DelistListingCommand, { listingId: string; status: string }> {
  constructor(
    @Inject(LISTING_REPOSITORY) private readonly listings: ListingRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: DelistListingCommand): Promise<{ listingId: string; status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const listing = await this.listings.findById(tenantId, ListingId.create(command.listingId));
    if (!listing) throw new NotFoundError(`Listing not found: ${command.listingId}`);
    listing.delist(command.dto.reason);
    await this.listings.save(listing);
    await this.outbox.publish(listing.pullEvents());
    return { listingId: listing.id.value, status: listing.status };
  }
}
