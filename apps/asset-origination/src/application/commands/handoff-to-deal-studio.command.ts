import { HandoffToDealStudioCommand } from './handoff-to-deal-studio.command';
import { HandoffToDealStudioDto } from '../dto/handoff-to-deal-studio.dto';

@CommandHandler(HandoffToDealStudioCommand)
export class HandoffToDealStudioHandler implements ICommandHandler<HandoffToDealStudioCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: HandoffToDealStudioCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.handoffToDeal('Handed off to Deal Studio by command handler');
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}