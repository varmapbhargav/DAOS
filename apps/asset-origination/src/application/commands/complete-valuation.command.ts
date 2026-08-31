import { AssetId, NotFoundError, TenantContextHolder, TenantId, ValuationMethodology } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ASSET_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { AssetRepository } from '../../domain/repositories/asset.repository';
import { CompleteValuationDto } from '../dto/asset-action.dto';

export class CompleteValuationCommand {
  constructor(
    public readonly assetId: string,
    public readonly dto: CompleteValuationDto,
  ) {}
}

@CommandHandler(CompleteValuationCommand)
export class CompleteValuationHandler implements ICommandHandler<CompleteValuationCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: CompleteValuationCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.updateValuation({
      fairValueMinorUnits: String(command.dto.fairValueMinorUnits),
      currency: command.dto.currency,
      methodology: command.dto.methodology as ValuationMethodology,
      valuedAt: new Date().toISOString(),
    }, actor);
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}
