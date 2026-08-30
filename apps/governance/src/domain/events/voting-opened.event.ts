import { DomainEvent } from '@daos/shared-kernel';

export class VotingOpened extends DomainEvent {
  get eventType(): string {
    return 'governance.voting.opened.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly startAt: string,
    public readonly endAt: string,
  ) {
    super(aggregateId, tenantId);
  }
}
