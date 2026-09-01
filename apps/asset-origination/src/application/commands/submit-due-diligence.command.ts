import { NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { AssetId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DueDiligenceReport } from '../../domain/entities/due-diligence-report.entity';
import { AssetRepository } from '../../domain/repositories/asset.repository';
import { DueDiligenceReportRepository } from '../../domain/repositories/due-diligence-report.repository';
import {
  ASSET_REPOSITORY,
  DUE_DILIGENCE_REPORT_REPOSITORY,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';

export class SubmitDueDiligenceCommand {
  constructor(public readonly assetId: string) {}
}

@CommandHandler(SubmitDueDiligenceCommand)
export class SubmitDueDiligenceHandler implements ICommandHandler<SubmitDueDiligenceCommand, { status: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
    @Inject(DUE_DILIGENCE_REPORT_REPOSITORY) private readonly reports: DueDiligenceReportRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: SubmitDueDiligenceCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = tenantId.value;
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    let report = await this.reports.findByAssetId(tenantId, asset.id.value);
    if (!report) {
      report = DueDiligenceReport.create({ tenantId, assetId: asset.id.value });
      await this.reports.save(report);
    }

    // Updated to use new lifecycle method
    asset.startDueDiligence(actor);
    await this.assets.save(asset);
    await this.outbox.publish(asset.pullEvents());
    return { status: asset.status };
  }
}

