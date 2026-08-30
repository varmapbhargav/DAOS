import { DomainEvent } from '@daos/shared-kernel';

export class CapitalStackUpdated extends DomainEvent {
  get eventType(): string { return 'deal.capital-stack.updated.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
