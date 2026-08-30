import { DomainEvent } from '@daos/shared-kernel';

export class KycApproved extends DomainEvent {
  get eventType(): string {
    return 'investor.kyc.approved.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly kycProfileId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
