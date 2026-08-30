import { RejectAssetCommand } from './reject-asset.command';
import { RejectAssetDto } from '../dto/reject-asset.dto';

@CommandHandler(RejectAssetCommand)
export class RejectAssetHandler implements ICommandHandler<RejectAssetCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: RejectAssetCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.reject('Rejected by command handler');
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}