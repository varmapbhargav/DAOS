import { DomainEvent, QualificationResultStatus } from '@daos/shared-kernel';

export class QualificationCompleted extends DomainEvent {
  get eventType(): string {
    return 'origination-case.qualification-completed.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly qualificationId: string,
    public readonly decision: QualificationResultStatus,
    public readonly overallScore: number,
    public readonly qualifiedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}
