import { DomainEvent } from '@daos/shared-kernel';

export class BillingPlanChanged extends DomainEvent {
  get eventType(): string {
    return 'organization.billing-plan-changed.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly planType: string,
    public readonly billingCycle: string,
  ) {
    super(aggregateId, tenantId);
  }
}
