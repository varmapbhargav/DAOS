import { AssetId, NotFoundError, TenantContextHolder, TenantId, ValuationMethodology } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ASSET_REPOSITORY } from '../../../domain/repositories/repository.tokens';
import { AssetRepository } from '../../domain/repositories/asset.repository';

export class StartValuationCommand {
  constructor(public readonly assetId: string) {}
}

@CommandHandler(StartValuationCommand)
export class StartValuationHandler implements ICommandHandler<StartValuationCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: StartValuationCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.updateValuation({
      fairValueMinorUnits: '0',
      currency: 'USD',
      methodology: 'dcf' as ValuationMethodology,
      valuedAt: new Date().toISOString(),
    }, actor);
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}
