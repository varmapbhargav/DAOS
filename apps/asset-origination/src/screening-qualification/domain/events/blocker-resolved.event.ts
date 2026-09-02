import { BlockerResolutionStatus, DomainEvent } from '@daos/shared-kernel';

export class BlockerResolved extends DomainEvent {
  get eventType(): string {
    return 'origination-case.blocker-resolved.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly blockerId: string,
    public readonly resolutionStatus: BlockerResolutionStatus,
    public readonly resolvedBy: string,
    public readonly resolvedReason: string | null,
  ) {
    super(aggregateId, tenantId);
  }
}