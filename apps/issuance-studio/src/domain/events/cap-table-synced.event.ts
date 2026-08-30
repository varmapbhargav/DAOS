import { DomainEvent } from '@daos/shared-kernel';

export class CapTableSynced extends DomainEvent {
  get eventType(): string {
    return 'issuance.cap-table.synced.v1';
  }

  constructor(aggregateId: string, tenantId: string, public readonly capTableId: string) {
    super(aggregateId, tenantId);
  }
}