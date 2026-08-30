import { DomainEvent } from '@daos/shared-kernel';

export class VoteCast extends DomainEvent {
  get eventType(): string {
    return 'governance.vote.cast.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly proposalId: string,
    public readonly votedBy: string,
    public readonly choice: 'for' | 'against' | 'abstain',
    public readonly shares: number,
  ) {
    super(aggregateId, tenantId);
  }
}
