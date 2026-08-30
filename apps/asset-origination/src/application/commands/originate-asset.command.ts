import {
  AssetClass,
  Collateral,
  Money,
  OutboxPublisher,
  ProvenanceRecord,
  TenantContextHolder,
  TenantId,
  UtcInstant,
} from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Asset } from '../../domain/aggregates/asset.aggregate';
import { ASSET_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { AssetRepository } from '../../domain/repositories/asset.repository';
import { OriginateAssetDto } from '../dto/originate-asset.dto';

export class OriginateAssetCommand {
  constructor(public readonly dto: OriginateAssetDto) {}
}

@CommandHandler(OriginateAssetCommand)
export class OriginateAssetHandler implements ICommandHandler<OriginateAssetCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: OriginateAssetCommand): Promise<{ assetId: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const collateral: Collateral[] = (dto.collateral ?? []).map((c) => ({
      type: c.type,
      description: c.description,
      estimatedValue: Money.of(
        BigInt(c.estimatedValueMinorUnits ?? 0),
        'USD',
      ),
      lienPosition: c.lienPosition,
    }));

    const provenance: ProvenanceRecord[] = (dto.provenance ?? []).map((p) => ({
      sourceType: p.sourceType as ProvenanceRecord['sourceType'],
      sourceRef: p.sourceRef,
      documentedAt: UtcInstant.fromIso(p.documentedAt),
      priorOwners: p.priorOwners ?? [],
    }));

    const asset = Asset.originate({
      tenantId,
      name: dto.name,
      assetClass: dto.assetClass as AssetClass,
      sponsorId: dto.sponsorId,
      jurisdictions: dto.jurisdictions ?? [],
      purchasePrice:
        dto.purchasePriceMinorUnits !== undefined && dto.purchasePriceCurrency
          ? Money.of(BigInt(dto.purchasePriceMinorUnits), dto.purchasePriceCurrency)
          : null,
      collateral,
      provenance,
    });

    await this.assets.save(asset);
    await this.outbox.publish(asset.pullEvents());
    return { assetId: asset.id.value };
  }
}
