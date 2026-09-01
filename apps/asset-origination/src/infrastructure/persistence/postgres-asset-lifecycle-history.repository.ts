import { AssetId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AssetLifecycleHistory } from '../../domain/entities/asset-lifecycle-history.entity';
import { AssetLifecycleHistoryRepository } from '../../domain/repositories/asset-lifecycle-history.repository';
import { AssetLifecycleHistoryOrmEntity } from './entities/asset-lifecycle-history.orm-entity';

@Injectable()
export class PostgresAssetLifecycleHistoryRepository implements AssetLifecycleHistoryRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(history: AssetLifecycleHistory): Promise<void> {
    const orm = new AssetLifecycleHistoryOrmEntity();
    orm.id = history.id;
    orm.assetId = history.assetId;
    orm.tenantId = history.tenantId;
    orm.previousStatus = history.previousStatus;
    orm.newStatus = history.newStatus;
    orm.transitionReason = history.transitionReason;
    orm.changedBy = history.changedBy;
    orm.changedAt = new Date(history.changedAt);
    orm.metadata = (history.metadata ?? {}) as object;

    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${history.tenantId}'`);
      await manager
        .getRepository(AssetLifecycleHistoryOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(AssetLifecycleHistoryOrmEntity)
        .values(orm)
        .orUpdate(
          ['new_status', 'changed_at', 'changed_by', 'transition_reason', 'metadata'],
          ['asset_id', 'previous_status'],
        )
        .execute();
    });
  }

  async findByAssetId(tenantId: TenantId, assetId: AssetId): Promise<AssetLifecycleHistory[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(AssetLifecycleHistoryOrmEntity)
        .find({ where: { assetId: assetId.value, tenantId: tenantId.value }, order: { changedAt: 'DESC' } });
    });
    return entities.map((e) =>
      AssetLifecycleHistory.reconstruct({
        id: e.id,
        assetId: e.assetId,
        tenantId: e.tenantId,
        previousStatus: e.previousStatus,
        newStatus: e.newStatus,
        transitionReason: e.transitionReason,
        changedBy: e.changedBy,
        changedAt: e.changedAt.toISOString(),
        metadata: (e.metadata ?? null) as Record<string, unknown> | null,
      }),
    );
  }
}