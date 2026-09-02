import { PoolAssetId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { PoolAsset } from '../../domain/entities/pool-asset.entity';
import { PoolAssetRepository } from '../../domain/repositories/pool-asset.repository';
import { PoolAssetOrmEntity } from './entities/pool-asset.orm-entity';
import { PoolAssetMapper } from './mappers/pool-asset.mapper';

@Injectable()
export class PostgresPoolAssetRepository implements PoolAssetRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(poolAsset: PoolAsset): Promise<void> {
    const orm = PoolAssetMapper.toOrm(poolAsset);
    const row = orm as unknown as Record<string, unknown>;
    await this.dataSource.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${poolAsset.tenantId.value}'`);
      await manager
        .createQueryBuilder()
        .insert()
        .into(PoolAssetOrmEntity)
        .values(row)
        .orUpdate(
          ['allocation_percentage', 'removed_at', 'removal_reason', 'updated_at'],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: PoolAssetId): Promise<PoolAsset | null> {
    const orm = await this.dataSource.manager.findOne(PoolAssetOrmEntity, {
      where: { id: id.value, tenantId: tenantId.value },
    });
    return orm ? PoolAssetMapper.toDomain(orm) : null;
  }

  async findByPoolId(tenantId: TenantId, poolId: string): Promise<PoolAsset[]> {
    const orms = await this.dataSource.manager.find(PoolAssetOrmEntity, {
      where: { poolId, tenantId: tenantId.value },
      order: { addedAt: 'ASC' } as any,
    });
    return orms.map(PoolAssetMapper.toDomain);
  }

  async findByAssetId(tenantId: TenantId, assetId: string): Promise<PoolAsset | null> {
    const orm = await this.dataSource.manager.findOne(PoolAssetOrmEntity, {
      where: { assetId, tenantId: tenantId.value },
      order: { addedAt: 'DESC' } as any,
    });
    return orm ? PoolAssetMapper.toDomain(orm) : null;
  }

  async findActiveByPoolId(tenantId: TenantId, poolId: string): Promise<PoolAsset[]> {
    const orms = await this.dataSource.manager.find(PoolAssetOrmEntity, {
      where: { poolId, tenantId: tenantId.value, removedAt: null as any },
      order: { addedAt: 'ASC' } as any,
    });
    return orms.map(PoolAssetMapper.toDomain);
  }
}