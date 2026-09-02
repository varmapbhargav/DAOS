import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ASSET_REPOSITORY } from '../../../domain/repositories/repository.tokens';
import { AssetRepository } from '../../domain/repositories/asset.repository';

export interface PipelineStageCount {
  status: string;
  count: number;
}

export interface AssetPipelineMetricsDto {
  total: number;
  byStatus: PipelineStageCount[];
  qualified: number;
  rejected: number;
  approved: number;
  submittedForApproval: number;
}

export class GetAssetPipelineMetricsQuery {}

@QueryHandler(GetAssetPipelineMetricsQuery)
export class GetAssetPipelineMetricsHandler
  implements IQueryHandler<GetAssetPipelineMetricsQuery, AssetPipelineMetricsDto>
{
  constructor(@Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository) {}

  async execute(_: GetAssetPipelineMetricsQuery): Promise<AssetPipelineMetricsDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const all = await this.assets.findAll(tenantId);

    const byStatus = new Map<string, number>();
    for (const asset of all) {
      byStatus.set(asset.status, (byStatus.get(asset.status) ?? 0) + 1);
    }
    const counts: PipelineStageCount[] = [...byStatus.entries()]
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: all.length,
      byStatus: counts,
      qualified: byStatus.get('QUALIFIED') ?? 0,
      rejected: byStatus.get('REJECTED') ?? 0,
      approved: byStatus.get('APPROVED') ?? 0,
      submittedForApproval: byStatus.get('READY_FOR_APPROVAL') ?? 0,
    };
  }
}
