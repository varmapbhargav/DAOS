import { DomainEvent } from '@daos/shared-kernel';

export class ClosingConditionWaived extends DomainEvent {
  get eventType(): string { return 'deal.closing-condition.waived.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
    public readonly description: string,
    public readonly reason: string,
  ) {
    super(aggregateId, tenantId);
  }
}
