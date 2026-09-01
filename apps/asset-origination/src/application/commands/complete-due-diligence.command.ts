import { AssetId, DDRating, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AssetRepository } from '../../domain/repositories/asset.repository';
import { ASSET_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { CompleteDueDiligenceDto } from '../dto/asset-action.dto';

export class CompleteDueDiligenceCommand {
  constructor(
    public readonly assetId: string,
    public readonly dto: CompleteDueDiligenceDto,
  ) {}
}

@CommandHandler(CompleteDueDiligenceCommand)
export class CompleteDueDiligenceHandler implements ICommandHandler<CompleteDueDiligenceCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: CompleteDueDiligenceCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = command.dto.completedBy || TenantContextHolder.get().userId || tenantId.value;
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    const rating = command.dto.rating as DDRating;
    asset.completeDueDiligence(rating, actor);
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}
