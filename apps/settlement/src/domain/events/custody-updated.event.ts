import { DomainEvent } from '@daos/shared-kernel';

export class CustodyUpdated extends DomainEvent {
  get eventType(): string {
    return 'custody.updated.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly securityId: string,
    public readonly quantity: string,
  ) {
    super(aggregateId, tenantId);
  }
}
