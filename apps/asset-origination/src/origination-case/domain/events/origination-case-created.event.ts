import { DomainEvent } from '@daos/shared-kernel';

export class OriginationCaseCreated extends DomainEvent {
  get eventType(): string {
    return 'origination-case.created.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly caseNumber: string,
  ) {
    super(aggregateId, tenantId);
  }
}
