import { DomainEvent } from '@daos/shared-kernel';

export class RegisteredAgentAppointed extends DomainEvent {
  get eventType(): string {
    return 'entity.registered-agent.appointed.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly agencyName: string,
  ) {
    super(aggregateId, tenantId);
  }
}