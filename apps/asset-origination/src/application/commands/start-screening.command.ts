import { StartScreeningCommand } from './start-screening.command';
import { TenantContextHolder, TenantId } from '@daos/shared-kernel';

@CommandHandler(StartScreeningCommand)
export class StartScreeningHandler implements ICommandHandler<StartScreeningCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: StartScreeningCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = tenantId.value;
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.startScreening(actor);
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}