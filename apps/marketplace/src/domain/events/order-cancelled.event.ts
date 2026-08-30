import { DomainEvent } from '@daos/shared-kernel';

export class OrderCancelled extends DomainEvent {
  get eventType(): string {
    return 'order.cancelled.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly listingId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
