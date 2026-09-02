import { AssetDto } from '@daos/asset-api';
import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { AssetId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ASSET_REPOSITORY } from '../../../domain/repositories/repository.tokens';
import { AssetRepository } from '../../domain/repositories/asset.repository';
import { toAssetDto } from '../asset.mapper';

export class GetAssetQuery {
  constructor(public readonly assetId: string) {}
}

@QueryHandler(GetAssetQuery)
export class GetAssetHandler implements IQueryHandler<GetAssetQuery, AssetDto> {
  constructor(@Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository) {}

  async execute(query: GetAssetQuery): Promise<AssetDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const asset = await this.assets.findById(tenantId, AssetId.create(query.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${query.assetId}`);
    return toAssetDto(asset);
  }
}
