import { AssetId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ASSET_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { AssetRepository } from '../../domain/repositories/asset.repository';

export class ResumeAssetCommand {
  constructor(
    public readonly assetId: string,
    public readonly targetStatus?: 'DUE_DILIGENCE' | 'VALUATION' | 'RISK_REVIEW',
  ) {}
}

@CommandHandler(ResumeAssetCommand)
export class ResumeAssetHandler implements ICommandHandler<ResumeAssetCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: ResumeAssetCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    const targetStatus = command.targetStatus ?? 'DUE_DILIGENCE';
    asset.resume(targetStatus, actor);
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}
