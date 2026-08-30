import { DomainEvent } from '@daos/shared-kernel';

export class ClosingConditionCreated extends DomainEvent {
  get eventType(): string { return 'deal.closing-condition.created.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
    public readonly description: string,
    public readonly category: string,
  ) {
    super(aggregateId, tenantId);
  }
}
