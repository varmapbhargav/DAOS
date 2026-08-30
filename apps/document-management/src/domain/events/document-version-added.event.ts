import { DomainEvent } from '@daos/shared-kernel';

export class DocumentVersionAdded extends DomainEvent {
  get eventType(): string {
    return 'document.version-added.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly versionNumber: number,
    public readonly fileRef: string,
    public readonly checksum: string,
  ) {
    super(aggregateId, tenantId);
  }
}