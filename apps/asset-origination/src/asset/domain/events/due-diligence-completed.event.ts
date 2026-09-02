import { DomainEvent } from '@daos/shared-kernel';

export class DueDiligenceCompleted extends DomainEvent {
  get eventType(): string {
    return 'asset.due-diligence.completed.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly reportId: string,
    public readonly rating: string,
  ) {
    super(aggregateId, tenantId);
  }
}
