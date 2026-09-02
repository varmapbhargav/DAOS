import {
  AssetClass,
  AssetId,
  Money,
  NotFoundError,
  ScreeningCriteria,
  TenantContextHolder,
  TenantId,
} from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ASSET_REPOSITORY } from '../../../domain/repositories/repository.tokens';
import { AssetRepository } from '../../domain/repositories/asset.repository';

export class CompleteScreeningCommand {
  constructor(public readonly assetId: string) {}
}

const ASSET_CLASSES: AssetClass[] = [
  'realEstate',
  'privateEquity',
  'privateCredit',
  'infrastructure',
  'ventureCapital',
  'commodities',
  'digitalAssets',
];

function defaultCriteria(assetClass: AssetClass, countries: string[]): ScreeningCriteria {
  const assetClassEligibility = {} as Record<AssetClass, boolean>;
  for (const ac of ASSET_CLASSES) assetClassEligibility[ac] = true;
  const jurisdictionEligibility: Record<string, boolean> = {};
  for (const c of countries) jurisdictionEligibility[c] = true;
  return {
    assetClassEligibility,
    jurisdictionEligibility,
    sponsorEligibility: {},
    regulatoryRestrictions: [],
    esgRestrictions: [],
    liquidityRequirements: {
      minimumDailyLiquidity: Money.zero('USD'),
      maximumLockupPeriodDays: 3650,
    },
    tenantInvestmentMandates: [],
  };
}

@CommandHandler(CompleteScreeningCommand)
export class CompleteScreeningHandler implements ICommandHandler<CompleteScreeningCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: CompleteScreeningCommand): Promise<{ assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) throw new NotFoundError(`Asset not found: ${command.assetId}`);

    asset.completeScreening(actor, defaultCriteria(asset.assetClass, asset.jurisdictions));
    await this.assets.save(asset);
    return { assetId: asset.id.value };
  }
}
