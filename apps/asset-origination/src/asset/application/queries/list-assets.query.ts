import { AssetDto } from '@daos/asset-api';
import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ASSET_REPOSITORY } from '../../../domain/repositories/repository.tokens';
import { AssetRepository } from '../../domain/repositories/asset.repository';
import { toAssetDto } from '../asset.mapper';

export class ListAssetsQuery {
  constructor(
    public readonly assetClass?: string,
    public readonly search?: string,
    public readonly status?: string,
    public readonly jurisdiction?: string,
  ) {}
}

@QueryHandler(ListAssetsQuery)
export class ListAssetsHandler implements IQueryHandler<ListAssetsQuery, AssetDto[]> {
  constructor(@Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository) {}

  async execute(query: ListAssetsQuery): Promise<AssetDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const list = await this.assets.findAll(tenantId);
    const filtered = list.filter((a) => {
      if (query.assetClass && a.assetClass !== query.assetClass) return false;
      if (query.status && a.status !== query.status) return false;
      if (query.jurisdiction && !a.jurisdictions.includes(query.jurisdiction)) return false;
      if (query.search) {
        const q = query.search.trim().toLowerCase();
        const haystack = [a.name, a.legalName, a.externalReference, a.internalReference]
          .filter((v): v is string => !!v)
          .map((v) => v.toLowerCase())
          .join(' ');
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    return filtered.map(toAssetDto);
  }
}
