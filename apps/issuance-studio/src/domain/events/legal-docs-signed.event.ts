import { DomainEvent } from '@daos/shared-kernel';

export class LegalDocsSigned extends DomainEvent {
  get eventType(): string {
    return 'issuance.legal-docs.signed.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly signedBy: string,
    public readonly signedAt: string,
  ) {
    super(aggregateId, tenantId);
  }
}