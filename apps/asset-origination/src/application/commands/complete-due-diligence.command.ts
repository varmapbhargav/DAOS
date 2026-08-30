import { CompleteDueDiligenceCommand } from './complete-due-diligence.command';
import { CompleteDueDiligenceDto } from '../dto/complete-due-diligence.dto';

@CommandHandler(CompleteDueDiligenceCommand)
export class CompleteDueDiligenceHandler implements ICommandHandler<CompleteDueDiligenceCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: CompleteDueDiligenceCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    // Rating would come from the DTO, for now use a default
    const rating: DDRating = 'BBB';
    asset.completeDueDiligence(rating, 'Due diligence completed by command handler');
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}