import { BlockerSeverity, DomainEvent } from '@daos/shared-kernel';

export class BlockerRaised extends DomainEvent {
  get eventType(): string {
    return 'origination-case.blocker-raised.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly blockerId: string,
    public readonly severity: BlockerSeverity,
    public readonly category: string,
    public readonly description: string,
  ) {
    super(aggregateId, tenantId);
  }
}