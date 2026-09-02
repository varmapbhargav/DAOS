import { DomainEvent, RiskLevel } from '@daos/shared-kernel';

export class RiskAssessmentCompleted extends DomainEvent {
  get eventType(): string {
    return 'origination-case.risk-assessment-completed.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly assessmentId: string,
    public readonly riskLevel: RiskLevel,
    public readonly overallScore: number,
    public readonly assessedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}