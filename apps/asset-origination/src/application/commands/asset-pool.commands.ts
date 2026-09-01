import { AssetPoolId, OutboxPublisher, PoolAssetId, PoolStatus, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AssetPool } from '../../domain/entities/asset-pool.entity';
import { PoolAsset } from '../../domain/entities/pool-asset.entity';
import { AssetPoolCreated } from '../../domain/events/asset-pool-events';
import { AssetAddedToPool } from '../../domain/events/asset-pool-events';
import { AssetRemovedFromPool } from '../../domain/events/asset-pool-events';
import { PoolRebalanced } from '../../domain/events/asset-pool-events';
import { PoolSplit } from '../../domain/events/asset-pool-events';
import { PoolMerged } from '../../domain/events/asset-pool-events';
import { PoolStatusChanged } from '../../domain/events/asset-pool-events';
import { AssetPoolRepository } from '../../domain/repositories/asset-pool.repository';
import { PoolAssetRepository } from '../../domain/repositories/pool-asset.repository';
import {
  ASSET_POOL_REPOSITORY,
  OUTBOX_PUBLISHER,
  POOL_ASSET_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import {
  AddAssetToPoolDto,
  ChangePoolStatusDto,
  CheckEligibilityDto,
  CreateAssetPoolDto,
  MergePoolsDto,
  RebalancePoolDto,
  RemoveAssetFromPoolDto,
  SetParentPoolDto,
  SplitPoolDto,
  UpdateAssetAllocationDto,
  UpdateAssetPoolDto,
  UpdateConcentrationRulesDto,
  UpdateEligibilityPolicyDto,
} from '../dto/asset-pool.dto';

export class CreateAssetPoolCommand {
  constructor(public readonly dto: CreateAssetPoolDto) {}
}

export class UpdateAssetPoolCommand {
  constructor(public readonly poolId: string, public readonly dto: UpdateAssetPoolDto) {}
}

export class ChangePoolStatusCommand {
  constructor(public readonly poolId: string, public readonly dto: ChangePoolStatusDto) {}
}

export class AddAssetToPoolCommand {
  constructor(public readonly poolId: string, public readonly dto: AddAssetToPoolDto) {}
}

export class UpdateAssetAllocationCommand {
  constructor(public readonly poolId: string, public readonly assetId: string, public readonly dto: UpdateAssetAllocationDto) {}
}

export class RemoveAssetFromPoolCommand {
  constructor(public readonly poolId: string, public readonly assetId: string, public readonly dto: RemoveAssetFromPoolDto) {}
}

export class RebalancePoolCommand {
  constructor(public readonly poolId: string, public readonly dto: RebalancePoolDto) {}
}

export class SplitPoolCommand {
  constructor(public readonly poolId: string, public readonly dto: SplitPoolDto) {}
}

export class MergePoolsCommand {
  constructor(public readonly targetPoolId: string, public readonly dto: MergePoolsDto) {}
}

export class UpdateConcentrationRulesCommand {
  constructor(public readonly poolId: string, public readonly dto: UpdateConcentrationRulesDto) {}
}

export class UpdateEligibilityPolicyCommand {
  constructor(public readonly poolId: string, public readonly dto: UpdateEligibilityPolicyDto) {}
}

export class CheckEligibilityCommand {
  constructor(public readonly poolId: string, public readonly dto: CheckEligibilityDto) {}
}

export class SetParentPoolCommand {
  constructor(public readonly poolId: string, public readonly dto: SetParentPoolDto) {}
}

@CommandHandler(CreateAssetPoolCommand)
export class CreateAssetPoolHandler implements ICommandHandler<CreateAssetPoolCommand, { poolId: string }> {
  constructor(
    @Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CreateAssetPoolCommand): Promise<{ poolId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const existing = await this.pools.findByName(tenantId, command.dto.name);
    if (existing) throw new Error('Pool with this name already exists');

    const pool = AssetPool.create({
      tenantId,
      name: command.dto.name,
      description: command.dto.description,
      poolType: command.dto.poolType as AssetPool['poolType'],
      strategy: command.dto.strategy as AssetPool['strategy'],
      currency: command.dto.currency,
      eligibilityPolicy: command.dto.eligibilityPolicy,
      concentrationRules: command.dto.concentrationRules as AssetPool['concentrationRules'],
      createdBy: actor,
    });
    await this.pools.save(pool);

    const event = new AssetPoolCreated(
      pool.id.value,
      tenantId.value,
      pool.id.value,
      pool.name,
      pool.poolType,
      pool.strategy,
      pool.currency,
      actor,
    );
    await this.outbox.publish([event]);

    return { poolId: pool.id.value };
  }
}

@CommandHandler(UpdateAssetPoolCommand)
export class UpdateAssetPoolHandler implements ICommandHandler<UpdateAssetPoolCommand, void> {
  constructor(@Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository) {}

  async execute(command: UpdateAssetPoolCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const pool = await this.pools.findById(tenantId, AssetPoolId.create(command.poolId));
    if (!pool) throw new NotFoundException('Pool not found');
    pool.updateBasicInfo(command.dto.name ?? pool.name, command.dto.description ?? pool.description);
    await this.pools.save(pool);
  }
}

@CommandHandler(ChangePoolStatusCommand)
export class ChangePoolStatusHandler implements ICommandHandler<ChangePoolStatusCommand, void> {
  constructor(
    @Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ChangePoolStatusCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const pool = await this.pools.findById(tenantId, AssetPoolId.create(command.poolId));
    if (!pool) throw new NotFoundException('Pool not found');

    const oldStatus = pool.status;
    const newStatus = command.dto.status as PoolStatus;

    if (oldStatus === newStatus) return;

    if (newStatus === 'ACTIVE') pool.activate();
    else if (newStatus === 'SUSPENDED') pool.suspend();
    else if (newStatus === 'CLOSED') pool.close();
    else if (newStatus === 'LIQUIDATING') pool.startLiquidation();
    else throw new Error(`Invalid status transition to ${newStatus}`);

    await this.pools.save(pool);

    const event = new PoolStatusChanged(
      pool.id.value,
      tenantId.value,
      pool.id.value,
      oldStatus,
      newStatus,
      actor,
      command.dto.reason ?? null,
    );
    await this.outbox.publish([event]);
  }
}

@CommandHandler(AddAssetToPoolCommand)
export class AddAssetToPoolHandler implements ICommandHandler<AddAssetToPoolCommand, { poolAssetId: string }> {
  constructor(
    @Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository,
    @Inject(POOL_ASSET_REPOSITORY) private readonly poolAssets: PoolAssetRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: AddAssetToPoolCommand): Promise<{ poolAssetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const pool = await this.pools.findById(tenantId, AssetPoolId.create(command.poolId));
    if (!pool) throw new NotFoundException('Pool not found');

    const poolAsset = PoolAsset.create({
      tenantId,
      poolId: command.poolId,
      assetId: command.dto.assetId,
      allocationPercentage: command.dto.allocationPercentage,
    });
    await this.poolAssets.save(poolAsset);

    pool.addAsset(poolAsset);
    await this.pools.save(pool);

    const event = new AssetAddedToPool(
      pool.id.value,
      tenantId.value,
      pool.id.value,
      poolAsset.id.value,
      command.dto.assetId,
      poolAsset.allocationPercentage,
      actor,
    );
    await this.outbox.publish([event]);

    return { poolAssetId: poolAsset.id.value };
  }
}

@CommandHandler(UpdateAssetAllocationCommand)
export class UpdateAssetAllocationHandler implements ICommandHandler<UpdateAssetAllocationCommand, void> {
  constructor(
    @Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository,
    @Inject(POOL_ASSET_REPOSITORY) private readonly poolAssets: PoolAssetRepository,
  ) {}

  async execute(command: UpdateAssetAllocationCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const pool = await this.pools.findById(tenantId, AssetPoolId.create(command.poolId));
    if (!pool) throw new NotFoundException('Pool not found');

    const poolAsset = await this.poolAssets.findById(tenantId, PoolAssetId.create(command.assetId));
    if (!poolAsset) throw new NotFoundException('Pool asset not found');

    pool.updateAssetAllocation(command.assetId, command.dto.allocationPercentage);
    poolAsset.updateAllocation(command.dto.allocationPercentage);

    await this.poolAssets.save(poolAsset);
    await this.pools.save(pool);
  }
}

@CommandHandler(RemoveAssetFromPoolCommand)
export class RemoveAssetFromPoolHandler implements ICommandHandler<RemoveAssetFromPoolCommand, void> {
  constructor(
    @Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository,
    @Inject(POOL_ASSET_REPOSITORY) private readonly poolAssets: PoolAssetRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RemoveAssetFromPoolCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const pool = await this.pools.findById(tenantId, AssetPoolId.create(command.poolId));
    if (!pool) throw new NotFoundException('Pool not found');

    const poolAsset = await this.poolAssets.findById(tenantId, PoolAssetId.create(command.assetId));
    if (!poolAsset) throw new NotFoundException('Pool asset not found');

    pool.removeAsset(command.assetId, command.dto.reason ?? null);
    poolAsset.remove(command.dto.reason ?? null);

    await this.poolAssets.save(poolAsset);
    await this.pools.save(pool);

    const event = new AssetRemovedFromPool(
      pool.id.value,
      tenantId.value,
      pool.id.value,
      poolAsset.id.value,
      command.assetId,
      actor,
      command.dto.reason ?? null,
    );
    await this.outbox.publish([event]);
  }
}

@CommandHandler(RebalancePoolCommand)
export class RebalancePoolHandler implements ICommandHandler<RebalancePoolCommand, { changes: any[] }> {
  constructor(
    @Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository,
    @Inject(POOL_ASSET_REPOSITORY) private readonly poolAssets: PoolAssetRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RebalancePoolCommand): Promise<{ changes: any[] }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const pool = await this.pools.findById(tenantId, AssetPoolId.create(command.poolId));
    if (!pool) throw new NotFoundException('Pool not found');

    const targetAllocations = new Map<string, number>(
      Object.entries(command.dto.targetAllocations),
    );
    const changes = pool.rebalance(targetAllocations);

    // Update pool assets
    for (const change of changes) {
      const poolAsset = await this.poolAssets.findById(tenantId, PoolAssetId.create(change.poolAssetId));
      if (poolAsset) {
        poolAsset.updateAllocation(change.newAllocation);
        await this.poolAssets.save(poolAsset);
      }
    }
    await this.pools.save(pool);

    const event = new PoolRebalanced(
      pool.id.value,
      tenantId.value,
      pool.id.value,
      actor,
      changes,
    );
    await this.outbox.publish([event]);

    return { changes };
  }
}

@CommandHandler(SplitPoolCommand)
export class SplitPoolHandler implements ICommandHandler<SplitPoolCommand, void> {
  constructor(
    @Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: SplitPoolCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const pool = await this.pools.findById(tenantId, AssetPoolId.create(command.poolId));
    if (!pool) throw new NotFoundException('Pool not found');

    pool.split(command.dto.criteria ?? {}, command.dto.newPoolIds);
    await this.pools.save(pool);

    const event = new PoolSplit(
      pool.id.value,
      tenantId.value,
      pool.id.value,
      command.dto.newPoolIds,
      actor,
      command.dto.criteria ?? {},
    );
    await this.outbox.publish([event]);
  }
}

@CommandHandler(MergePoolsCommand)
export class MergePoolsHandler implements ICommandHandler<MergePoolsCommand, void> {
  constructor(
    @Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: MergePoolsCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const targetPool = await this.pools.findById(tenantId, AssetPoolId.create(command.targetPoolId));
    if (!targetPool) throw new NotFoundException('Target pool not found');

    targetPool.merge(command.dto.sourcePoolIds);
    await this.pools.save(targetPool);

    const event = new PoolMerged(
      targetPool.id.value,
      tenantId.value,
      targetPool.id.value,
      command.dto.sourcePoolIds,
      actor,
    );
    await this.outbox.publish([event]);
  }
}

@CommandHandler(UpdateConcentrationRulesCommand)
export class UpdateConcentrationRulesHandler implements ICommandHandler<UpdateConcentrationRulesCommand, void> {
  constructor(@Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository) {}

  async execute(command: UpdateConcentrationRulesCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const pool = await this.pools.findById(tenantId, AssetPoolId.create(command.poolId));
    if (!pool) throw new NotFoundException('Pool not found');
    // Clear and re-add all rules
    for (const rule of command.dto.rules) {
      pool.addConcentrationRule(rule as any);
    }
    await this.pools.save(pool);
  }
}

@CommandHandler(UpdateEligibilityPolicyCommand)
export class UpdateEligibilityPolicyHandler implements ICommandHandler<UpdateEligibilityPolicyCommand, void> {
  constructor(@Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository) {}

  async execute(command: UpdateEligibilityPolicyCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const pool = await this.pools.findById(tenantId, AssetPoolId.create(command.poolId));
    if (!pool) throw new NotFoundException('Pool not found');
    pool.updateEligibilityPolicy(command.dto.policy as any);
    await this.pools.save(pool);
  }
}

@CommandHandler(CheckEligibilityCommand)
export class CheckEligibilityHandler implements ICommandHandler<CheckEligibilityCommand, { eligible: boolean; reasons: string[] }> {
  constructor(@Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository) {}

  async execute(command: CheckEligibilityCommand): Promise<{ eligible: boolean; reasons: string[] }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const pool = await this.pools.findById(tenantId, AssetPoolId.create(command.poolId));
    if (!pool) throw new NotFoundException('Pool not found');
    return pool.checkEligibility(command.dto as any);
  }
}

@CommandHandler(SetParentPoolCommand)
export class SetParentPoolHandler implements ICommandHandler<SetParentPoolCommand, void> {
  constructor(@Inject(ASSET_POOL_REPOSITORY) private readonly pools: AssetPoolRepository) {}

  async execute(command: SetParentPoolCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const pool = await this.pools.findById(tenantId, AssetPoolId.create(command.poolId));
    if (!pool) throw new NotFoundException('Pool not found');
    pool.setParentPool(command.dto.parentPoolId);
    await this.pools.save(pool);
  }
}