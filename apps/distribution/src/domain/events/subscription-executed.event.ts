import { DomainEvent } from '@daos/shared-kernel';

export class SubscriptionExecuted extends DomainEvent {
  get eventType(): string {
    return 'subscription.executed.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly executedAt: string,
  ) {
    super(aggregateId, tenantId);
  }
}