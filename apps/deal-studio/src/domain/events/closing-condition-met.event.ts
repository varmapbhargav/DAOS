import { DomainEvent } from '@daos/shared-kernel';

export class ClosingConditionMet extends DomainEvent {
  get eventType(): string { return 'deal.closing-condition.met.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly description: string,
    public readonly verifiedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}
