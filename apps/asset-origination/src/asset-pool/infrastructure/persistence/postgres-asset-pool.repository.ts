import { AssetPoolId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { AssetPool } from '../../domain/entities/asset-pool.entity';
import { PoolAsset } from '../../domain/entities/pool-asset.entity';
import { AssetPoolRepository } from '../../domain/repositories/asset-pool.repository';
import { AssetPoolOrmEntity } from './entities/asset-pool.orm-entity';
import { PoolAssetOrmEntity } from './entities/pool-asset.orm-entity';
import { AssetPoolMapper } from './mappers/asset-pool.mapper';
import { PoolAssetMapper } from './mappers/pool-asset.mapper';

@Injectable()
export class PostgresAssetPoolRepository implements AssetPoolRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(pool: AssetPool): Promise<void> {
    const poolOrm = AssetPoolMapper.toOrm(pool);
    const poolRow = poolOrm as unknown as Record<string, unknown>;
    const assets = Array.from(pool.assets.values());
    const assetRows = assets.map((a) => PoolAssetMapper.toOrm(a) as unknown as Record<string, unknown>);

    await this.dataSource.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${pool.tenantId.value}'`);
      
      // Upsert pool
      await manager
        .createQueryBuilder()
        .insert()
        .into(AssetPoolOrmEntity)
        .values(poolRow)
        .orUpdate(
          [
            'name',
            'description',
            'pool_type',
            'strategy',
            'currency',
            'status',
            'concentration_rules',
            'eligibility_policy',
            'gross_value',
            'net_value',
            'outstanding_value',
            'jurisdictions',
            'weighted_avg_maturity',
            'weighted_avg_ltv',
            'concentration',
            'version',
            'updated_at',
            'closed_at',
            'parent_pool_id',
            'child_pool_ids',
          ],
          ['id'],
        )
        .execute();

      // Upsert pool assets
      if (assetRows.length > 0) {
        await manager
          .createQueryBuilder()
          .insert()
          .into(PoolAssetOrmEntity)
          .values(assetRows)
          .orUpdate(
            ['allocation_percentage', 'removed_at', 'removal_reason', 'updated_at'],
            ['id'],
          )
          .execute();
      }
    });
  }

  async findById(tenantId: TenantId, id: AssetPoolId): Promise<AssetPool | null> {
    const poolOrm = await this.dataSource.manager.findOne(AssetPoolOrmEntity, {
      where: { id: id.value, tenantId: tenantId.value },
    });
    if (!poolOrm) return null;

    const assetOrms = await this.dataSource.manager.find(PoolAssetOrmEntity, {
      where: { poolId: id.value, tenantId: tenantId.value },
    });
    const assets = new Map<string, PoolAsset>();
    for (const a of assetOrms) {
      assets.set(a.assetId, PoolAssetMapper.toDomain(a));
    }

    return AssetPoolMapper.toDomain(poolOrm, assets);
  }

  async findByName(tenantId: TenantId, name: string): Promise<AssetPool | null> {
    const poolOrm = await this.dataSource.manager.findOne(AssetPoolOrmEntity, {
      where: { name, tenantId: tenantId.value },
    });
    if (!poolOrm) return null;
    return this.findById(tenantId, AssetPoolId.create(poolOrm.id));
  }

  async findAll(tenantId: TenantId): Promise<AssetPool[]> {
    const poolOrms = await this.dataSource.manager.find(AssetPoolOrmEntity, {
      where: { tenantId: tenantId.value },
      order: { createdAt: 'DESC' } as any,
    });
    const pools: AssetPool[] = [];
    for (const p of poolOrms) {
      const pool = await this.findById(tenantId, AssetPoolId.create(p.id));
      if (pool) pools.push(pool);
    }
    return pools;
  }

  async findByStatus(tenantId: TenantId, status: string): Promise<AssetPool[]> {
    const poolOrms = await this.dataSource.manager.find(AssetPoolOrmEntity, {
      where: { status, tenantId: tenantId.value },
      order: { createdAt: 'DESC' } as any,
    });
    const pools: AssetPool[] = [];
    for (const p of poolOrms) {
      const pool = await this.findById(tenantId, AssetPoolId.create(p.id));
      if (pool) pools.push(pool);
    }
    return pools;
  }

  async findChildPools(tenantId: TenantId, parentPoolId: string): Promise<AssetPool[]> {
    const poolOrms = await this.dataSource.manager.find(AssetPoolOrmEntity, {
      where: { parentPoolId, tenantId: tenantId.value },
    });
    const pools: AssetPool[] = [];
    for (const p of poolOrms) {
      const pool = await this.findById(tenantId, AssetPoolId.create(p.id));
      if (pool) pools.push(pool);
    }
    return pools;
  }
}