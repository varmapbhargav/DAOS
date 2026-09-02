import { AssetPoolId, ConcentrationRule, EligibilityPolicy, PoolStatus, PoolStrategy, PoolType, TenantId } from '@daos/shared-kernel';

import { AssetPool } from '../../../domain/entities/asset-pool.entity';
import { PoolAsset } from '../../../domain/entities/pool-asset.entity';
import { AssetPoolOrmEntity } from '../entities/asset-pool.orm-entity';

export class AssetPoolMapper {
  static toOrm(pool: AssetPool): AssetPoolOrmEntity {
    const orm = new AssetPoolOrmEntity();
    orm.id = pool.id.value;
    orm.tenantId = pool.tenantId.value;
    orm.name = pool.name;
    orm.description = pool.description;
    orm.poolType = pool.poolType;
    orm.strategy = pool.strategy;
    orm.currency = pool.currency;
    orm.status = pool.status;
    orm.concentrationRules = pool.concentrationRules;
    orm.eligibilityPolicy = pool.eligibilityPolicy;
    orm.grossValue = pool.grossValue;
    orm.netValue = pool.netValue;
    orm.outstandingValue = pool.outstandingValue;
    orm.jurisdictions = pool.jurisdictions;
    orm.weightedAvgMaturity = pool.weightedAvgMaturity;
    orm.weightedAvgLtv = pool.weightedAvgLTV;
    orm.concentration = pool.concentration;
    orm.version = pool.version;
    orm.createdBy = pool.createdBy;
    orm.createdAt = pool.createdAt;
    orm.updatedAt = pool.updatedAt;
    orm.closedAt = pool.closedAt;
    orm.parentPoolId = pool.parentPoolId;
    orm.childPoolIds = pool.childPoolIds;
    return orm;
  }

  static toDomain(orm: AssetPoolOrmEntity, assets: Map<string, PoolAsset>): AssetPool {
    return AssetPool.reconstruct({
      id: AssetPoolId.create(orm.id),
      tenantId: TenantId.create(orm.tenantId),
      name: orm.name,
      description: orm.description,
      poolType: orm.poolType as PoolType,
      strategy: orm.strategy as PoolStrategy,
      currency: orm.currency,
      status: orm.status as PoolStatus,
      assets,
      concentrationRules: orm.concentrationRules as ConcentrationRule[],
      eligibilityPolicy: orm.eligibilityPolicy as EligibilityPolicy,
      grossValue: orm.grossValue,
      netValue: orm.netValue,
      outstandingValue: orm.outstandingValue,
      jurisdictions: orm.jurisdictions,
      weightedAvgMaturity: orm.weightedAvgMaturity,
      weightedAvgLTV: orm.weightedAvgLtv,
      concentration: orm.concentration,
      version: orm.version,
      createdBy: orm.createdBy,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      closedAt: orm.closedAt,
      parentPoolId: orm.parentPoolId,
      childPoolIds: orm.childPoolIds,
    });
  }
}