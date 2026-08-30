import { StartDueDiligenceCommand } from './start-due-diligence.command';
import { StartDueDiligenceDto } from '../dto/start-due-diligence.dto';

@CommandHandler(StartDueDiligenceCommand)
export class StartDueDiligenceHandler implements ICommandHandler<StartDueDiligenceCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: StartDueDiligenceCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.startDueDiligence('Due diligence started by command handler');
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}