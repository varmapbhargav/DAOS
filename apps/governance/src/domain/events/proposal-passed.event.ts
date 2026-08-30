import { DomainEvent } from '@daos/shared-kernel';

export class ProposalPassed extends DomainEvent {
  get eventType(): string {
    return 'governance.proposal.passed.v1';
  }

  constructor(aggregateId: string, tenantId: string) {
    super(aggregateId, tenantId);
  }
}
