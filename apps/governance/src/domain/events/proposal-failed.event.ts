import { DomainEvent } from '@daos/shared-kernel';

export class ProposalFailed extends DomainEvent {
  get eventType(): string {
    return 'governance.proposal.failed.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly reason: string,
  ) {
    super(aggregateId, tenantId);
  }
}
