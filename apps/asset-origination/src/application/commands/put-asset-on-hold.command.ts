import { PutAssetOnHoldCommand } from './put-asset-on-hold.command';
import { PutAssetOnHoldDto } from '../dto/put-asset-on-hold.dto';

@CommandHandler(PutAssetOnHoldCommand)
export class PutAssetOnHoldHandler implements ICommandHandler<PutAssetOnHoldCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: PutAssetOnHoldCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.putOnHold('Put on hold by command handler');
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}