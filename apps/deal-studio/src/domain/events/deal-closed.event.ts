import { DomainEvent } from '@daos/shared-kernel';

export class DealClosed extends DomainEvent {
  get eventType(): string { return 'deal.closed.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
