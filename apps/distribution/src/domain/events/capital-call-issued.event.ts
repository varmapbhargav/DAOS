import { DomainEvent, Money } from '@daos/shared-kernel';

export class CapitalCallIssued extends DomainEvent {
  get eventType(): string {
    return 'capital-call.issued.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly closingId: string,
    public readonly investorId: string,
    public readonly amount: Money,
    public readonly dueDate: string,
  ) {
    super(aggregateId, tenantId);
  }
}