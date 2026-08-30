import { DomainEvent } from '@daos/shared-kernel';

export class PaymentMethodUpdated extends DomainEvent {
  get eventType(): string {
    return 'organization.payment-method-updated.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly methodType: string,
    public readonly last4: string | null,
  ) {
    super(aggregateId, tenantId);
  }
}
