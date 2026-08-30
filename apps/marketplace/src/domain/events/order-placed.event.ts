import { DomainEvent } from '@daos/shared-kernel';

export class OrderPlaced extends DomainEvent {
  get eventType(): string {
    return 'order.placed.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly listingId: string,
    public readonly investorId: string,
    public readonly side: string,
    public readonly orderType: string,
    public readonly quantity: string,
    public readonly limitPrice: { amount: string; currency: string } | null,
  ) {
    super(aggregateId, tenantId);
  }
}
