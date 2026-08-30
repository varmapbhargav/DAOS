import { ResumeAssetCommand } from './resume-asset.command';
import { ResumeAssetDto } from '../dto/resume-asset.dto';

@CommandHandler(ResumeAssetCommand)
export class ResumeAssetHandler implements ICommandHandler<ResumeAssetCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: ResumeAssetCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.resume('DUE_DILIGENCE', 'Resumed from hold by command handler');
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}