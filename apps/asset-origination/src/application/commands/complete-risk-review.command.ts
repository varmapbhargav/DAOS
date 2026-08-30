import { CompleteRiskReviewCommand } from './complete-risk-review.command';
import { CompleteRiskReviewDto } from '../dto/complete-risk-review.dto';

@CommandHandler(CompleteRiskReviewCommand)
export class CompleteRiskReviewHandler implements ICommandHandler<CompleteRiskReviewCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: CompleteRiskReviewCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.completeRiskReview('Risk review completed by command handler');
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}