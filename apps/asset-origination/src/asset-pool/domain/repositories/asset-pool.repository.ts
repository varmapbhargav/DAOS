import { AssetPoolId, TenantId } from '@daos/shared-kernel';

import { AssetPool } from '../entities/asset-pool.entity';

export interface AssetPoolRepository {
  save(pool: AssetPool): Promise<void>;
  findById(tenantId: TenantId, id: AssetPoolId): Promise<AssetPool | null>;
  findByName(tenantId: TenantId, name: string): Promise<AssetPool | null>;
  findAll(tenantId: TenantId): Promise<AssetPool[]>;
  findByStatus(tenantId: TenantId, status: string): Promise<AssetPool[]>;
  findChildPools(tenantId: TenantId, parentPoolId: string): Promise<AssetPool[]>;
}