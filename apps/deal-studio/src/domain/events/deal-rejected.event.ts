import { DomainEvent } from '@daos/shared-kernel';

export class DealRejected extends DomainEvent {
  get eventType(): string { return 'deal.rejected.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
    public readonly reason: string,
  ) {
    super(aggregateId, tenantId);
  }
}
