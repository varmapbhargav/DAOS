import { DomainEvent } from '@daos/shared-kernel';

export class SubscriptionCanceled extends DomainEvent {
  get eventType(): string {
    return 'organization.subscription-canceled.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly planType: string,
  ) {
    super(aggregateId, tenantId);
  }
}
