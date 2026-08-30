import { DomainEvent } from '@daos/shared-kernel';

export class OrderPartiallyFilled extends DomainEvent {
  get eventType(): string {
    return 'order.partially-filled.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly listingId: string,
    public readonly filledQuantity: string,
  ) {
    super(aggregateId, tenantId);
  }
}
