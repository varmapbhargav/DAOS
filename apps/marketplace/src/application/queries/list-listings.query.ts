import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { LISTING_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ListingRepository } from '../../domain/repositories/listing.repository';
import { ListingDto, toListingDto } from '../marketplace.mapper';

export class ListListingsQuery {
  constructor(
    public readonly productId?: string,
    public readonly activeOnly?: boolean,
  ) {}
}

@QueryHandler(ListListingsQuery)
export class ListListingsHandler implements IQueryHandler<ListListingsQuery, ListingDto[]> {
  constructor(@Inject(LISTING_REPOSITORY) private readonly listings: ListingRepository) {}

  async execute(query: ListListingsQuery): Promise<ListingDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    let rows: ListingDto[];
    if (query.productId) {
      rows = (await this.listings.findByProductId(tenantId, query.productId)).map(toListingDto);
    } else if (query.activeOnly) {
      rows = (await this.listings.findActive(tenantId)).map(toListingDto);
    } else {
      rows = (await this.listings.findAll(tenantId)).map(toListingDto);
    }
    return rows;
  }
}
