import { DomainEvent } from '@daos/shared-kernel';

export class DealResumed extends DomainEvent {
  get eventType(): string { return 'deal.resumed.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
