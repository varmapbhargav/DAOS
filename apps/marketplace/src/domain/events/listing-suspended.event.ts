import { DomainEvent } from '@daos/shared-kernel';

export class ListingSuspended extends DomainEvent {
  get eventType(): string {
    return 'listing.suspended.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly reason: string,
  ) {
    super(aggregateId, tenantId);
  }
}
