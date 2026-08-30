import { DomainEvent } from '@daos/shared-kernel';

export class ScenarioCalculated extends DomainEvent {
  get eventType(): string { return 'deal.scenario.calculated.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly scenarioId: string,
    public readonly scenarioName: string,
    public readonly result: {
      irr: number | null;
      moic: number | null;
      npv: { amount: string; currency: string };
      cashOnCash: number | null;
      equityMultiple: number | null;
      yield: number | null;
    },
    public readonly calculatedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}
