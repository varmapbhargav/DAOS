import { DomainEvent } from '@daos/shared-kernel';

export class AssetApproved extends DomainEvent {
  get eventType(): string {
    return 'asset.approved.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly approvedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}
