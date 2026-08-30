import { DomainEvent } from '@daos/shared-kernel';

export class VotingClosed extends DomainEvent {
  get eventType(): string {
    return 'governance.voting.closed.v1';
  }

  constructor(aggregateId: string, tenantId: string) {
    super(aggregateId, tenantId);
  }
}
