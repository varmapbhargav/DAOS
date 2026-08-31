import { AssetId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ASSET_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { AssetRepository } from '../../domain/repositories/asset.repository';

export class RejectAssetCommand {
  constructor(
    public readonly assetId: string,
    public readonly reason: string,
  ) {}
}

@CommandHandler(RejectAssetCommand)
export class RejectAssetHandler implements ICommandHandler<RejectAssetCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: RejectAssetCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.reject(command.reason, actor);
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}
