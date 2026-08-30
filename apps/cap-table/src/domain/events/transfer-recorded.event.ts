import { DomainEvent } from '@daos/shared-kernel';

export class TransferRecorded extends DomainEvent {
  get eventType(): string {
    return 'cap-table.transfer-recorded.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly transferId: string,
    public readonly fromShareholderId: string,
    public readonly toShareholderId: string,
    public readonly shareClassId: string,
    public readonly units: string,
    public readonly transferType: string,
  ) {
    super(aggregateId, tenantId);
  }
}