import { ApiKeyId, TenantId } from '@daos/shared-kernel';

import { ApiKey } from '../aggregates/api-key.aggregate';

export interface ApiKeyRepository {
  save(apiKey: ApiKey): Promise<void>;
  findById(tenantId: TenantId, id: ApiKeyId): Promise<ApiKey | null>;
  findByLabel(tenantId: TenantId, label: string): Promise<ApiKey | null>;
  findByHash(tenantId: TenantId, keyHash: string): Promise<ApiKey | null>;
  listByTenant(tenantId: TenantId): Promise<ApiKey[]>;
}
