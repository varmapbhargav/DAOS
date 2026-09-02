import { DomainEvent } from '@daos/shared-kernel';

export class DataRequestCreated extends DomainEvent {
  get eventType(): string {
    return 'data-request.created.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly caseId: string,
    public readonly requestedFrom: string,
  ) {
    super(aggregateId, tenantId);
  }
}