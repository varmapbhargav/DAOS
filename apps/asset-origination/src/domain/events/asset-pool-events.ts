import { DomainEvent, PoolStatus, PoolType, PoolStrategy } from '@daos/shared-kernel';

export class AssetPoolCreated extends DomainEvent {
  get eventType(): string {
    return 'asset-pool.created.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly poolId: string,
    public readonly name: string,
    public readonly poolType: PoolType,
    public readonly strategy: PoolStrategy,
    public readonly currency: string,
    public readonly createdBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}

export class AssetAddedToPool extends DomainEvent {
  get eventType(): string {
    return 'asset-pool.asset-added.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly poolId: string,
    public readonly poolAssetId: string,
    public readonly assetId: string,
    public readonly allocationPercentage: number,
    public readonly addedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}

export class AssetRemovedFromPool extends DomainEvent {
  get eventType(): string {
    return 'asset-pool.asset-removed.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly poolId: string,
    public readonly poolAssetId: string,
    public readonly assetId: string,
    public readonly removedBy: string,
    public readonly reason: string | null,
  ) {
    super(aggregateId, tenantId);
  }
}

export class PoolRebalanced extends DomainEvent {
  get eventType(): string {
    return 'asset-pool.rebalanced.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly poolId: string,
    public readonly rebalancedBy: string,
    public readonly changes: { poolAssetId: string; oldAllocation: number; newAllocation: number }[],
  ) {
    super(aggregateId, tenantId);
  }
}

export class PoolSplit extends DomainEvent {
  get eventType(): string {
    return 'asset-pool.split.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly originalPoolId: string,
    public readonly newPoolIds: string[],
    public readonly splitBy: string,
    public readonly criteria: Record<string, unknown>,
  ) {
    super(aggregateId, tenantId);
  }
}

export class PoolMerged extends DomainEvent {
  get eventType(): string {
    return 'asset-pool.merged.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly targetPoolId: string,
    public readonly sourcePoolIds: string[],
    public readonly mergedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}

export class PoolStatusChanged extends DomainEvent {
  get eventType(): string {
    return 'asset-pool.status-changed.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly poolId: string,
    public readonly oldStatus: PoolStatus,
    public readonly newStatus: PoolStatus,
    public readonly changedBy: string,
    public readonly reason: string | null,
  ) {
    super(aggregateId, tenantId);
  }
}