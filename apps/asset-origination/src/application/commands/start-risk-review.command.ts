import { AssetId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AssetRepository } from '../../domain/repositories/asset.repository';
import { ASSET_REPOSITORY } from '../../domain/repositories/repository.tokens';

export class StartRiskReviewCommand {
  constructor(public readonly assetId: string) {}
}

@CommandHandler(StartRiskReviewCommand)
export class StartRiskReviewHandler implements ICommandHandler<StartRiskReviewCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: StartRiskReviewCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.startRiskReview(actor);
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}
