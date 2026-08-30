import { AssetLifecycleHistoryDto } from '@daos/asset-api';
import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ASSET_LIFECYCLE_HISTORY_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { AssetLifecycleHistoryRepository } from '../../domain/repositories/asset-lifecycle-history.repository';
import { AssetId } from '@daos/shared-kernel';

export class GetAssetLifecycleHistoryQuery {
  constructor(public readonly assetId: string) {}
}

@QueryHandler(GetAssetLifecycleHistoryQuery)
export class GetAssetLifecycleHistoryHandler implements IQueryHandler<GetAssetLifecycleHistoryQuery, AssetLifecycleHistoryDto[]> {
  constructor(@Inject(ASSET_LIFECYCLE_HISTORY_REPOSITORY) private readonly historyRepo: AssetLifecycleHistoryRepository) {}

  async execute(query: GetAssetLifecycleHistoryQuery): Promise<AssetLifecycleHistoryDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const history = await this.historyRepo.findByAssetId(tenantId, AssetId.create(query.assetId));
    return history.map((h) => ({
      id: h.id,
      assetId: h.assetId,
      tenantId: h.tenantId,
      previousStatus: h.previousStatus,
      newStatus: h.newStatus,
      transitionReason: h.transitionReason,
      changedBy: h.changedBy,
      changedAt: h.changedAt,
      metadata: h.metadata,
    }));
  }
}