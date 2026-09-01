import { DomainEvent } from '@daos/shared-kernel';

export class EvidenceAdded extends DomainEvent {
  get eventType(): string {
    return 'evidence.added.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly assetId: string | null,
    public readonly evidenceType: string,
  ) {
    super(aggregateId, tenantId);
  }
}