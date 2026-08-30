import { DomainEvent } from '@daos/shared-kernel';

export class AssetOriginated extends DomainEvent {
  get eventType(): string {
    return 'asset.originated.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly sponsorId: string,
    public readonly assetClass: string,
  ) {
    super(aggregateId, tenantId);
  }
}
