import { DomainEvent } from '@daos/shared-kernel';

export class ParticipantChanged extends DomainEvent {
  get eventType(): string { return 'deal.participant.changed.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
    public readonly participantId: string,
    public readonly changeType: 'ADDED' | 'REMOVED' | 'ROLE_CHANGED',
  ) {
    super(aggregateId, tenantId);
  }
}