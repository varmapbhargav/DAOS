import { WithdrawAssetCommand } from './withdraw-asset.command';
import { WithdrawAssetDto } from '../dto/withdraw-asset.dto';

@CommandHandler(WithdrawAssetCommand)
export class WithdrawAssetHandler implements ICommandHandler<WithdrawAssetCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: WithdrawAssetCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.withdraw('Withdrawn by command handler');
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}