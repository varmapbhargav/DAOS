import { DomainEvent } from '@daos/shared-kernel';

export class DealClosingStarted extends DomainEvent {
  get eventType(): string { return 'deal.closing.started.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
