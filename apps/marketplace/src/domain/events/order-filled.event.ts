import { DomainEvent } from '@daos/shared-kernel';

export class OrderFilled extends DomainEvent {
  get eventType(): string {
    return 'order.filled.v1';
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
