import { DomainEvent } from '@daos/shared-kernel';

export class KycRejected extends DomainEvent {
  get eventType(): string {
    return 'investor.kyc.rejected.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly kycProfileId: string,
    public readonly reason: string,
  ) {
    super(aggregateId, tenantId);
  }
}
