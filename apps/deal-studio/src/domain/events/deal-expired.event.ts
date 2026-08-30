import { DomainEvent } from '@daos/shared-kernel';

export class DealExpired extends DomainEvent {
  get eventType(): string { return 'deal.expired.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
    public readonly reason: string,
  ) {
    super(aggregateId, tenantId);
  }
}
