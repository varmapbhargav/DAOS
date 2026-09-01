import { PoolAssetId, TenantId } from '@daos/shared-kernel';
import { PoolAsset } from '../../../domain/entities/pool-asset.entity';
import { PoolAssetOrmEntity } from '../entities/pool-asset.orm-entity';

export class PoolAssetMapper {
  static toOrm(poolAsset: PoolAsset): PoolAssetOrmEntity {
    const orm = new PoolAssetOrmEntity();
    orm.id = poolAsset.id.value;
    orm.tenantId = poolAsset.tenantId.value;
    orm.poolId = poolAsset.poolId;
    orm.assetId = poolAsset.assetId;
    orm.allocationPercentage = poolAsset.allocationPercentage;
    orm.addedAt = poolAsset.addedAt;
    orm.removedAt = poolAsset.removedAt;
    orm.removalReason = poolAsset.removalReason;
    orm.updatedAt = new Date();
    return orm;
  }

  static toDomain(orm: PoolAssetOrmEntity): PoolAsset {
    return PoolAsset.reconstruct({
      id: PoolAssetId.create(orm.id),
      tenantId: TenantId.create(orm.tenantId),
      poolId: orm.poolId,
      assetId: orm.assetId,
      allocationPercentage: orm.allocationPercentage,
      addedAt: orm.addedAt,
      removedAt: orm.removedAt,
      removalReason: orm.removalReason,
    });
  }
}