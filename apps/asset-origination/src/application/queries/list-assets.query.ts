import { AssetDto } from '@daos/asset-api';
import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ASSET_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { AssetRepository } from '../../domain/repositories/asset.repository';
import { toAssetDto } from '../asset.mapper';

export class ListAssetsQuery {
  constructor(public readonly assetClass?: string) {}
}

@QueryHandler(ListAssetsQuery)
export class ListAssetsHandler implements IQueryHandler<ListAssetsQuery, AssetDto[]> {
  constructor(@Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository) {}

  async execute(query: ListAssetsQuery): Promise<AssetDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const list = await this.assets.findAll(tenantId);
    const filtered = query.assetClass ? list.filter((a) => a.assetClass === query.assetClass) : list;
    return filtered.map(toAssetDto);
  }
}
