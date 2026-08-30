import { DomainEvent } from '@daos/shared-kernel';

export class DealApproved extends DomainEvent {
  get eventType(): string { return 'deal.approved.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
