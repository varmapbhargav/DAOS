import { DomainEvent, Money } from '@daos/shared-kernel';

export class SubscriptionReceived extends DomainEvent {
  get eventType(): string {
    return 'subscription.received.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly productId: string,
    public readonly investorId: string,
    public readonly requestedAmount: Money,
  ) {
    super(aggregateId, tenantId);
  }
}