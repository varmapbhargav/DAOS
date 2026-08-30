import { DomainEvent } from '@daos/shared-kernel';

export class ListingPublished extends DomainEvent {
  get eventType(): string {
    return 'listing.published.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly productId: string,
    public readonly issueId: string | null,
    public readonly listingType: string,
    public readonly mechanism: string,
    public readonly price: { amount: string; currency: string },
    public readonly totalQuantity: string,
  ) {
    super(aggregateId, tenantId);
  }
}
