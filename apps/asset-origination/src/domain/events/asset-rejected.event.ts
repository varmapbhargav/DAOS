import { DomainEvent } from '@daos/shared-kernel';

export class AssetRejected extends DomainEvent {
  get eventType(): string {
    return 'asset.rejected.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly reason: string,
  ) {
    super(aggregateId, tenantId);
  }
}
