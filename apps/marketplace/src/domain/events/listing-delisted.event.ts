import { DomainEvent } from '@daos/shared-kernel';

export class ListingDelisted extends DomainEvent {
  get eventType(): string {
    return 'listing.delisted.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly reason: string,
  ) {
    super(aggregateId, tenantId);
  }
}
