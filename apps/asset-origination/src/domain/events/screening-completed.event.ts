import { DomainEvent, ScreeningResultStatus } from '@daos/shared-kernel';

export class ScreeningCompleted extends DomainEvent {
  get eventType(): string {
    return 'origination-case.screening-completed.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly screeningId: string,
    public readonly decision: ScreeningResultStatus,
    public readonly score: number,
    public readonly maxScore: number,
    public readonly reviewer: string,
  ) {
    super(aggregateId, tenantId);
  }
}
