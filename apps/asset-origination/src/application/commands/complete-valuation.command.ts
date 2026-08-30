import { CompleteValuationCommand } from './complete-valuation.command';
import { CompleteValuationDto } from '../dto/complete-valuation.dto';

@CommandHandler(CompleteValuationCommand)
export class CompleteValuationHandler implements ICommandHandler<CompleteValuationCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: CompleteValuationCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    const valuation = {
      fairValueMinorUnits: '1500000000',
      currency: 'USD',
      methodology: 'dcf',
    };
    asset.updateValuation(valuation, 'Valuation completed by command handler');
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}