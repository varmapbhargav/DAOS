import { DomainEvent } from '@daos/shared-kernel';

export class ClosingCompleted extends DomainEvent {
  get eventType(): string {
    return 'closing.completed.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly completedAt: string,
  ) {
    super(aggregateId, tenantId);
  }
}