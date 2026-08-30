import { DomainEvent } from '@daos/shared-kernel';

export class DocumentGenerated extends DomainEvent {
  get eventType(): string {
    return 'entity.document.generated.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly entityId: string,
    public readonly docType: string,
    public readonly fileRef: string,
  ) {
    super(aggregateId, tenantId);
  }
}