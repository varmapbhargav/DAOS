import { DdCategory, DdSeverity, DomainEvent } from '@daos/shared-kernel';

export class DDFindingCreated extends DomainEvent {
  get eventType(): string {
    return 'origination-case.dd-finding-created.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly findingId: string,
    public readonly category: DdCategory,
    public readonly severity: DdSeverity,
    public readonly description: string,
  ) {
    super(aggregateId, tenantId);
  }
}