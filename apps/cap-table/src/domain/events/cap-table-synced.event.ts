import { DomainEvent } from '@daos/shared-kernel';

export class CapTableSynced extends DomainEvent {
  get eventType(): string {
    return 'cap-table.synced.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly totalIssuedUnits: string,
    public readonly blockNumber: string,
  ) {
    super(aggregateId, tenantId);
  }
}