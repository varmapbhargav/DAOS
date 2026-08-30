import { SubmitForApprovalCommand } from './submit-for-approval.command';
import { SubmitForApprovalDto } from '../dto/submit-for-approval.dto';

@CommandHandler(SubmitForApprovalCommand)
export class SubmitForApprovalHandler implements ICommandHandler<SubmitForApprovalCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: SubmitForApprovalCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.submitForApproval('Submitted for approval by command handler');
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}