import { DomainEvent } from '@daos/shared-kernel';

export class SubscriptionDocumentsSent extends DomainEvent {
  get eventType(): string {
    return 'subscription.documents-sent.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly sentAt: string,
  ) {
    super(aggregateId, tenantId);
  }
}