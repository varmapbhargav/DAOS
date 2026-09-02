import {
  AssetClass,
  AssetSubClass,
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

import { ASSET_REPOSITORY, OUTBOX_PUBLISHER } from '../../../domain/repositories/repository.tokens';
import { Asset } from '../../domain/aggregates/asset.aggregate';
import { AssetRepository } from '../../domain/repositories/asset.repository';
import { CreateAssetDraftDto } from '../dto/asset-action.dto';

export class CreateAssetDraftCommand {
  constructor(public readonly dto: CreateAssetDraftDto) {}
}

@CommandHandler(CreateAssetDraftCommand)
export class CreateAssetDraftHandler implements ICommandHandler<CreateAssetDraftCommand, { assetId: string }> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CreateAssetDraftCommand): Promise<{ assetId: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const collateral: Collateral[] = (dto.collateral ?? []).map((c) => ({
      type: c.type,
      description: c.description,
      estimatedValue: Money.of(BigInt(c.estimatedValueMinorUnits ?? 0), 'USD'),
      lienPosition: c.lienPosition ?? 0,
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
      assetSubClass: 'residential' as AssetSubClass,
      sponsorId: dto.sponsorId ?? 'unknown',
      legalName: dto.name,
      country: dto.country ?? '',
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
