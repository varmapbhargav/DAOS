import { NotFoundError, OutboxPublisher, TenantContextHolder, TenantId, ValuationMethodology } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AssetId } from '@daos/shared-kernel';

import { ASSET_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { AssetRepository } from '../../domain/repositories/asset.repository';
import { UpdateValuationDto } from '../dto/asset-action.dto';

export class UpdateValuationCommand {
  constructor(
    public readonly assetId: string,
    public readonly dto: UpdateValuationDto,
  ) {}
}

@CommandHandler(UpdateValuationCommand)
export class UpdateValuationHandler implements ICommandHandler<UpdateValuationCommand, { status: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: UpdateValuationCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = tenantId.value;
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.updateValuation({
      fairValueMinorUnits: String(command.dto.fairValueMinorUnits),
      currency: command.dto.currency,
      methodology: command.dto.methodology as ValuationMethodology,
      valuedAt: new Date().toISOString(),
    }, actor);

    await this.assets.save(asset);
    await this.outbox.publish(asset.pullEvents());
    return { status: asset.status };
  }
}
