import { DomainEvent } from '@daos/shared-kernel';

export class TenantProvisioned extends DomainEvent {
  get eventType(): string {
    return 'identity.tenant.provisioned.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly subdomain: string,
    public readonly name: string,
  ) {
    super(aggregateId, tenantId);
  }
}
