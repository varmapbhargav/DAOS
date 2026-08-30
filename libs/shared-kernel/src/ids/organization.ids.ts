import { randomUUID } from 'node:crypto';

import { DomainId } from '@daos/shared-kernel';

export class TenantProfileId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): TenantProfileId {
    return new TenantProfileId(value ?? randomUUID());
  }
}

export class ServiceEntitlementId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): ServiceEntitlementId {
    return new ServiceEntitlementId(value ?? randomUUID());
  }
}

export class ApiKeyId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): ApiKeyId {
    return new ApiKeyId(value ?? randomUUID());
  }
}
