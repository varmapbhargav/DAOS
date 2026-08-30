import { DomainEvent } from '@daos/shared-kernel';

export class ApiKeyRotated extends DomainEvent {
  get eventType(): string {
    return 'organization.api-key-rotated.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly keyId: string,
    public readonly scope: string,
  ) {
    super(aggregateId, tenantId);
  }
}
