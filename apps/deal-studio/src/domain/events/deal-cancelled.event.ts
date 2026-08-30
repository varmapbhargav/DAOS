import { DomainEvent } from '@daos/shared-kernel';

export class DealCancelled extends DomainEvent {
  get eventType(): string { return 'deal.cancelled.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly reason: string,
  ) {
    super(aggregateId, tenantId);
  }
}
