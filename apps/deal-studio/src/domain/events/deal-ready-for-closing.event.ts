import { DomainEvent } from '@daos/shared-kernel';

export class DealReadyForClosing extends DomainEvent {
  get eventType(): string { return 'deal.ready-for-closing.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
