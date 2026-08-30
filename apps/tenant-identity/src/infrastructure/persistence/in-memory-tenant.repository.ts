import { TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

import { Tenant } from '../../domain/aggregates/tenant.aggregate';
import { TenantRepository } from '../../domain/repositories/tenant.repository';

@Injectable()
export class InMemoryTenantRepository implements TenantRepository {
  private readonly store = new Map<string, Tenant>();

  async save(tenant: Tenant): Promise<void> {
    this.store.set(tenant.id.value, tenant);
  }

  async findById(id: TenantId): Promise<Tenant | null> {
    return this.store.get(id.value) ?? null;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    for (const tenant of this.store.values()) {
      if (tenant.subdomain === subdomain) return tenant;
    }
    return null;
  }
}
