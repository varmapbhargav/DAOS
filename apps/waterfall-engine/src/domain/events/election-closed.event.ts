import { DomainEvent } from '@daos/shared-kernel';

export class ElectionClosed extends DomainEvent {
  get eventType(): string {
    return 'election.closed.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly issuanceId: string,
    public readonly electionCount: number,
  ) {
    super(aggregateId, tenantId);
  }
}
