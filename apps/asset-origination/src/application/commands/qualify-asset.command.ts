import { QualifyAssetCommand } from './qualify-asset.command';
import { QualifyAssetDto } from '../dto/qualify-asset.dto';

@CommandHandler(QualifyAssetCommand)
export class QualifyAssetHandler implements ICommandHandler<QualifyAssetCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: QualifyAssetCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.qualify('Qualification completed by command handler');
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}