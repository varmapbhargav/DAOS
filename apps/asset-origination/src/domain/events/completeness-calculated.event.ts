import { CompletenessBreakdown, DomainEvent } from '@daos/shared-kernel';

export class CompletenessCalculated extends DomainEvent {
  get eventType(): string {
    return 'origination-case.completeness-calculated.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly completenessId: string,
    public readonly overall: number,
    public readonly breakdown: CompletenessBreakdown,
    public readonly calculatedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}