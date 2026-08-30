import { ApproveAssetCommand } from './approve-asset.command';
import { ApproveAssetDto } from '../dto/approve-asset.dto';

@CommandHandler(ApproveAssetCommand)
export class ApproveAssetHandler implements ICommandHandler<ApproveAssetCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: ApproveAssetCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    const approvedBy = command.approvedBy || 'system';
    asset.approve(approvedBy, 'Approved by ' + approvedBy);
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}