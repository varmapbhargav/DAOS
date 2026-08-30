import { CreateAssetDraftDto } from '../dto/create-asset-draft.dto';
import { AssetClass, Collateral, Money, OutboxPublisher, ProvenanceRecord, TenantContextHolder, TenantId, UtcInstant, AssetId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Asset } from '../../domain/aggregates/asset.aggregate';
import { ASSET_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { AssetRepository } from '../../domain/repositories/asset.repository';
import { CreateAssetDraftCommand } from './create-asset-draft.command';

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

    const asset = Asset.reconstruct({
      id: AssetId.create(),
      tenantId,
      name: dto.name,
      assetClass: dto.assetClass as AssetClass,
      sponsorId: dto.sponsorId,
      status: 'DRAFT' as const,
      jurisdictions: dto.jurisdictions ?? [],
      purchasePrice: null,
      collateral: [],
      provenance: [],
      valuation: null,
      dueDiligenceRating: null,
      approvedBy: null,
      rejectionReason: null,
      version: 0,
    });

    await this.assets.save(asset);
    await this.outbox.publish(asset.pullEvents());
    return { assetId: asset.id.value };
  }
}