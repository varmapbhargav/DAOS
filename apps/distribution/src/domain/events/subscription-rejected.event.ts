import { DomainEvent } from '@daos/shared-kernel';

export class SubscriptionRejected extends DomainEvent {
  get eventType(): string {
    return 'subscription.rejected.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly reason: string,
  ) {
    super(aggregateId, tenantId);
  }
}