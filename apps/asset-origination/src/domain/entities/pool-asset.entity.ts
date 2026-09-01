import { AssetPoolId, ConcentrationRule, EligibilityPolicy, PoolAssetId, PoolStatus, PoolStrategy, PoolType, TenantId } from '@daos/shared-kernel';

export class PoolAsset {
  private constructor(
    public readonly id: PoolAssetId,
    public readonly tenantId: TenantId,
    public readonly poolId: string,
    public readonly assetId: string,
    private _allocationPercentage: number,
    private _addedAt: string,
    private _removedAt: string | null,
    private _removalReason: string | null,
  ) {}

  static create(params: {
    tenantId: TenantId;
    poolId: string;
    assetId: string;
    allocationPercentage: number;
  }): PoolAsset {
    return new PoolAsset(
      PoolAssetId.create(),
      params.tenantId,
      params.poolId,
      params.assetId,
      params.allocationPercentage,
      new Date().toISOString(),
      null,
      null,
    );
  }

  static reconstruct(params: {
    id: PoolAssetId;
    tenantId: TenantId;
    poolId: string;
    assetId: string;
    allocationPercentage: number;
    addedAt: string;
    removedAt: string | null;
    removalReason: string | null;
  }): PoolAsset {
    return new PoolAsset(
      params.id,
      params.tenantId,
      params.poolId,
      params.assetId,
      params.allocationPercentage,
      params.addedAt,
      params.removedAt,
      params.removalReason,
    );
  }

  get allocationPercentage(): number {
    return this._allocationPercentage;
  }
  get addedAt(): string {
    return this._addedAt;
  }
  get removedAt(): string | null {
    return this._removedAt;
  }
  get removalReason(): string | null {
    return this._removalReason;
  }
  get isActive(): boolean {
    return this._removedAt === null;
  }

  updateAllocation(newPercentage: number): void {
    if (this._removedAt) throw new Error('Cannot update allocation of removed asset');
    if (newPercentage < 0 || newPercentage > 100) throw new Error('Allocation must be between 0 and 100');
    this._allocationPercentage = newPercentage;
  }

  remove(reason: string | null): void {
    if (this._removedAt) throw new Error('Asset already removed from pool');
    this._removedAt = new Date().toISOString();
    this._removalReason = reason;
  }
}