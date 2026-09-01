import { DomainEvent } from '@daos/shared-kernel';

export class OwnershipVerified extends DomainEvent {
  get eventType(): string {
    return 'ownership.verified.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly assetId: string,
    public readonly verifiedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}