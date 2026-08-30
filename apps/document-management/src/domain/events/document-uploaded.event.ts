import { DomainEvent } from '@daos/shared-kernel';

import { EntityReference } from '@daos/shared-kernel';

export class DocumentUploaded extends DomainEvent {
  get eventType(): string {
    return 'document.uploaded.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly fileName: string,
    public readonly category: string,
    public readonly entityRef: EntityReference,
    public readonly versionNumber: number,
  ) {
    super(aggregateId, tenantId);
  }
}