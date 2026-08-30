import { DomainEvent } from '@daos/shared-kernel';

import { ShareholderRecordState } from '@daos/shared-kernel';

export class CapTableUpdated extends DomainEvent {
  get eventType(): string {
    return 'cap-table.updated.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly shareholders: ShareholderRecordState[],
    public readonly totalIssuedUnits: string,
  ) {
    super(aggregateId, tenantId);
  }
}