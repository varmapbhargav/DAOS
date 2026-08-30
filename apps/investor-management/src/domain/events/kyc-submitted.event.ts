import { DomainEvent } from '@daos/shared-kernel';

export class KycSubmitted extends DomainEvent {
  get eventType(): string {
    return 'investor.kyc.submitted.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly kycProfileId: string,
    public readonly providerRef: string,
  ) {
    super(aggregateId, tenantId);
  }
}
