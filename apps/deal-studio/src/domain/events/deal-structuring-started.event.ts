import { DomainEvent } from '@daos/shared-kernel';

export class DealStructuringStarted extends DomainEvent {
  get eventType(): string { return 'deal.structuring.started.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
