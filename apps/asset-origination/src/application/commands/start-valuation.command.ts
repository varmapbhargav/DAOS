import { StartValuationCommand } from './start-valuation.command';
import { StartValuationDto } from '../dto/start-valuation.dto';

@CommandHandler(StartValuationCommand)
export class StartValuationHandler implements ICommandHandler<StartValuationCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: StartValuationCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.updateValuation({
      fairValueMinorUnits: '0',
      currency: 'USD',
      methodology: 'dcf',
    }, 'Valuation started by command handler');
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}