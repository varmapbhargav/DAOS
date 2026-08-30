import { DomainEvent } from '@daos/shared-kernel';

export class ProposalCreated extends DomainEvent {
  get eventType(): string {
    return 'governance.proposal.created.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly createdById: string,
    public readonly title: string,
  ) {
    super(aggregateId, tenantId);
  }
}
