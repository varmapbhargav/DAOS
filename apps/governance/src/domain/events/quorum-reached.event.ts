import { DomainEvent } from '@daos/shared-kernel';

export class QuorumReached extends DomainEvent {
  get eventType(): string {
    return 'governance.quorum.reached.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly sharesVoting: number,
  ) {
    super(aggregateId, tenantId);
  }
}
