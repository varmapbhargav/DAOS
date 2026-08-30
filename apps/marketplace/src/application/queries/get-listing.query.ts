import { ListingId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { LISTING_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ListingRepository } from '../../domain/repositories/listing.repository';
import { ListingDto, toListingDto } from '../marketplace.mapper';

export class GetListingQuery {
  constructor(public readonly listingId: string) {}
}

@QueryHandler(GetListingQuery)
export class GetListingHandler implements IQueryHandler<GetListingQuery, ListingDto> {
  constructor(@Inject(LISTING_REPOSITORY) private readonly listings: ListingRepository) {}

  async execute(query: GetListingQuery): Promise<ListingDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const listing = await this.listings.findById(tenantId, ListingId.create(query.listingId));
    if (!listing) throw new NotFoundError(`Listing not found: ${query.listingId}`);
    return toListingDto(listing);
  }
}
