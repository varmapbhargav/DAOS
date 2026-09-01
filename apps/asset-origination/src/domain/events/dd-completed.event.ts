import { DomainEvent } from '@daos/shared-kernel';

export class DDCompleted extends DomainEvent {
  get eventType(): string {
    return 'origination-case.dd-completed.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly ddCaseId: string,
    public readonly completedBy: string,
    public readonly findingCount: number,
  ) {
    super(aggregateId, tenantId);
  }
}