import { StartRiskReviewCommand } from './start-risk-review.command';
import { StartRiskReviewDto } from '../dto/start-risk-review.dto';

@CommandHandler(StartRiskReviewCommand)
export class StartRiskReviewHandler implements ICommandHandler<StartRiskReviewCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: StartRiskReviewCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.startRiskReview('Risk review started by command handler');
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}