import { DomainEvent } from '@daos/shared-kernel';

export class ClosingConditionChanged extends DomainEvent {
  get eventType(): string { return 'deal.closing-condition.changed.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
    public readonly conditionId: string,
    public readonly changeType: 'MET' | 'WAIVED' | 'VERIFIED',
    public readonly previousStatus?: string,
    public readonly newStatus?: string,
  ) {
    super(aggregateId, tenantId);
  }
}