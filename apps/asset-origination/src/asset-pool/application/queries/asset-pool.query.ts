import { AssetPoolId,TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  ASSET_POOL_REPOSITORY,
  POOL_ASSET_REPOSITORY,
} from '../../../domain/repositories/repository.tokens';
import { AssetPoolRepository } from '../../domain/repositories/asset-pool.repository';
import { PoolAssetRepository } from '../../domain/repositories/pool-asset.repository';

export class GetAssetPoolQuery {
  constructor(public readonly poolId: string) {}
}

export class GetAssetPoolByNameQuery {
  constructor(public readonly name: string) {}
}

export class ListAssetPoolsQuery {
  constructor(public readonly status?: string) {}
}

export class ListPoolAssetsQuery {
  constructor(public readonly poolId: string) {}
}

export class GetPoolAssetByAssetQuery {
  constructor(public readonly poolId: string, public readonly assetId: string) {}
}

@QueryHandler(GetAssetPoolQuery)
export class GetAssetPoolHandler implements IQueryHandler<GetAssetPoolQuery> {
  constructor(@Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository) {}

  async execute(query: GetAssetPoolQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const pool = await this.pools.findById(tenantId, AssetPoolId.create(query.poolId));
    if (!pool) return null;
    return this.toDto(pool);
  }

  public toDto(pool: any) {
    return {
      id: pool.id.value,
      name: pool.name,
      description: pool.description,
      poolType: pool.poolType,
      strategy: pool.strategy,
      currency: pool.currency,
      status: pool.status,
      concentrationRules: pool.concentrationRules,
      eligibilityPolicy: pool.eligibilityPolicy,
      grossValue: pool.grossValue,
      netValue: pool.netValue,
      outstandingValue: pool.outstandingValue,
      jurisdictions: pool.jurisdictions,
      weightedAvgMaturity: pool.weightedAvgMaturity,
      weightedAvgLTV: pool.weightedAvgLTV,
      concentration: pool.concentration,
      version: pool.version,
      createdBy: pool.createdBy,
      createdAt: pool.createdAt,
      updatedAt: pool.updatedAt,
      closedAt: pool.closedAt,
      parentPoolId: pool.parentPoolId,
      childPoolIds: pool.childPoolIds,
      assets: pool.activeAssets.map((a: any) => ({
        id: a.id.value,
        assetId: a.assetId,
        allocationPercentage: a.allocationPercentage,
        addedAt: a.addedAt,
      })),
    };
  }
}

@QueryHandler(GetAssetPoolByNameQuery)
export class GetAssetPoolByNameHandler implements IQueryHandler<GetAssetPoolByNameQuery> {
  constructor(@Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository) {}

  async execute(query: GetAssetPoolByNameQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const pool = await this.pools.findByName(tenantId, query.name);
    if (!pool) return null;
    return GetAssetPoolHandler.prototype.toDto.call(this, pool);
  }
}

@QueryHandler(ListAssetPoolsQuery)
export class ListAssetPoolsHandler implements IQueryHandler<ListAssetPoolsQuery> {
  constructor(@Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository) {}

  async execute(query: ListAssetPoolsQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const pools = query.status
      ? await this.pools.findByStatus(tenantId, query.status)
      : await this.pools.findAll(tenantId);
    return pools.map(this.toDto);
  }

  private toDto(pool: any) {
    return {
      id: pool.id.value,
      name: pool.name,
      description: pool.description,
      poolType: pool.poolType,
      strategy: pool.strategy,
      currency: pool.currency,
      status: pool.status,
      grossValue: pool.grossValue,
      netValue: pool.netValue,
      outstandingValue: pool.outstandingValue,
      concentration: pool.concentration,
      version: pool.version,
      createdBy: pool.createdBy,
      createdAt: pool.createdAt,
      updatedAt: pool.updatedAt,
      closedAt: pool.closedAt,
      parentPoolId: pool.parentPoolId,
      childPoolIds: pool.childPoolIds,
      assetCount: pool.activeAssets.length,
    };
  }
}

@QueryHandler(ListPoolAssetsQuery)
export class ListPoolAssetsHandler implements IQueryHandler<ListPoolAssetsQuery> {
  constructor(
    @Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository,
    @Inject(POOL_ASSET_REPOSITORY) private readonly poolAssets: PoolAssetRepository,
  ) {}

  async execute(query: ListPoolAssetsQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const pool = await this.pools.findById(tenantId, AssetPoolId.create(query.poolId));
    if (!pool) return [];
    return pool.activeAssets.map((a: any) => ({
      id: a.id.value,
      assetId: a.assetId,
      allocationPercentage: a.allocationPercentage,
      addedAt: a.addedAt,
    }));
  }
}

@QueryHandler(GetPoolAssetByAssetQuery)
export class GetPoolAssetByAssetHandler implements IQueryHandler<GetPoolAssetByAssetQuery> {
  constructor(@Inject(POOL_ASSET_REPOSITORY) private readonly poolAssets: PoolAssetRepository) {}

  async execute(query: GetPoolAssetByAssetQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const pa = await this.poolAssets.findByAssetId(tenantId, query.assetId);
    if (!pa || pa.poolId !== query.poolId) return null;
    return {
      id: pa.id.value,
      poolId: pa.poolId,
      assetId: pa.assetId,
      allocationPercentage: pa.allocationPercentage,
      addedAt: pa.addedAt,
      removedAt: pa.removedAt,
      removalReason: pa.removalReason,
      isActive: pa.isActive,
    };
  }
}