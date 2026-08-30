import { CompleteScreeningCommand } from './complete-screening.command';
import { CompleteScreeningDto } from '../dto/complete-screening.dto';
import { TenantContextHolder, TenantId } from '@daos/shared-kernel';

@CommandHandler(CompleteScreeningCommand)
export class CompleteScreeningHandler implements ICommandHandler<CompleteScreeningCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: CompleteScreeningCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = tenantId.value;
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.completeScreening(actor, command.dto);
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}