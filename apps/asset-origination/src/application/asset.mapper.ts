import { AssetDto } from '@daos/asset-api';

import { Asset } from '../domain/aggregates/asset.aggregate';

export function toAssetDto(asset: Asset): AssetDto {
  return {
    id: asset.id.value,
    tenantId: asset.tenantId.value,
    name: asset.name,
    assetClass: asset.assetClass,
    assetSubClass: asset.assetSubClass,
    sponsorId: asset.sponsorId,
    legalName: asset.legalName,
    externalReference: asset.externalReference,
    internalReference: asset.internalReference,
    status: asset.status,
    jurisdictions: asset.jurisdictions,
    purchasePrice: asset.purchasePrice
      ? {
          amountMinorUnits: asset.purchasePrice.amount.toString(),
          currency: asset.purchasePrice.currency,
        }
      : null,
    collateral: asset.collateral.map((c) => ({
      type: c.type,
      description: c.description,
      estimatedValue: {
        amountMinorUnits: c.estimatedValue.amount.toString(),
        currency: c.estimatedValue.currency,
      },
      lienPosition: c.lienPosition,
    })),
    provenance: asset.provenance.map((p) => ({
      sourceType: p.sourceType,
      sourceRef: p.sourceRef,
      documentedAt: p.documentedAt.toIso(),
      priorOwners: p.priorOwners,
    })),
    valuation: asset.valuation
      ? {
          fairValueMinorUnits: asset.valuation.fairValueMinorUnits,
          currency: asset.valuation.currency,
          methodology: asset.valuation.methodology,
          valuedAt: asset.valuation.valuedAt,
        }
      : null,
    version: asset.version,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: asset.source
      ? {
          sourceId: asset.source.sourceId,
          sourceType: asset.source.sourceType,
          sourceEntityId: asset.source.sourceEntityId,
          sourceReference: asset.source.sourceReference,
          originatedAt: asset.source.originatedAt.toIso(),
          submittedBy: asset.source.submittedBy,
          relationshipManager: asset.source.relationshipManager,
        }
      : null,
  };
}
