import { DomainEvent } from '@daos/shared-kernel';

export class ApiKeyRevoked extends DomainEvent {
  get eventType(): string {
    return 'organization.api-key-revoked.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly keyId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
