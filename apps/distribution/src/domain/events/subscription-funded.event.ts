import { DomainEvent, Money } from '@daos/shared-kernel';

export class SubscriptionFunded extends DomainEvent {
  get eventType(): string {
    return 'subscription.funded.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly amount: Money,
    public readonly paymentRef: string,
  ) {
    super(aggregateId, tenantId);
  }
}