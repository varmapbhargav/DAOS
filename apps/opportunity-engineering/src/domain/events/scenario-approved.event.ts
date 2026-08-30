import { DomainEvent } from '@daos/shared-kernel';

export class ScenarioApproved extends DomainEvent {
  get eventType(): string {
    return 'opportunity.scenario.approved.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly scenarioModelId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
