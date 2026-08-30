import { DomainEvent } from '@daos/shared-kernel';

export class DealOnHold extends DomainEvent {
  get eventType(): string { return 'deal.on-hold.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
    public readonly reason: string,
  ) {
    super(aggregateId, tenantId);
  }
}
