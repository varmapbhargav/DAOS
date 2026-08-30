import {
  AssetClass,
  AssetId,
  AssetOriginationStatus,
  Collateral,
  DDRating,
  Money,
  ProvenanceRecord,
  TenantId,
  UtcInstant,
  ValuationMethodology,
} from '@daos/shared-kernel';

import { Asset } from '../../../domain/aggregates/asset.aggregate';
import { AssetOrmEntity } from '../entities/asset.orm-entity';
import { SponsorReferenceOrmEntity } from '../entities/sponsor-reference.orm-entity';

type CollateralJson = {
  type: string;
  description: string;
  estimatedValue: { amountMinorUnits: string; currency: string };
  lienPosition: number;
};

type ProvenanceJson = {
  sourceType: string;
  sourceRef: string;
  documentedAt: string;
  priorOwners: string[];
};

export class AssetMapper {
  static toDomain(e: AssetOrmEntity): Asset {
    const collateral = (e.collateral as unknown as CollateralJson[]).map((c): Collateral => ({
      type: c.type,
      description: c.description,
      estimatedValue: Money.of(BigInt(c.estimatedValue.amountMinorUnits), c.estimatedValue.currency),
      lienPosition: c.lienPosition,
    }));

    const provenance = (e.provenance as unknown as ProvenanceJson[]).map((p): ProvenanceRecord => ({
      sourceType: p.sourceType as ProvenanceRecord['sourceType'],
      sourceRef: p.sourceRef,
      documentedAt: UtcInstant.fromIso(p.documentedAt),
      priorOwners: p.priorOwners,
    }));

    return Asset.reconstruct({
      id: AssetId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      name: e.name,
      assetClass: e.assetClass as AssetClass,
      sponsorId: e.sponsorId,
      status: e.status as AssetOriginationStatus,
      jurisdictions: e.jurisdictions,
      purchasePrice:
        e.purchasePriceAmount !== null && e.purchasePriceCurrency
          ? Money.of(BigInt(e.purchasePriceAmount), e.purchasePriceCurrency)
          : null,
      collateral,
      provenance,
      valuation:
        e.valuationFairValue !== null
          ? {
              fairValueMinorUnits: e.valuationFairValue,
              currency: e.valuationCurrency ?? 'USD',
              methodology: (e.valuationMethodology ?? 'dcf') as ValuationMethodology,
              valuedAt: e.valuationValuedAt,
            }
          : null,
      dueDiligenceRating: e.dueDiligenceRating as DDRating | null,
      approvedBy: e.approvedBy,
      rejectionReason: e.rejectionReason,
      version: e.version,
      sponsorReference: e.sponsorReferences
        ? {
            id: e.sponsorReferences.id,
            entityId: e.sponsorReferences.entityId,
            tenantId: e.sponsorReferences.tenantId,
            name: e.sponsorReferences.name,
            jurisdiction: e.sponsorReferences.jurisdiction,
            relationshipStatus: e.sponsorReferences.relationshipStatus,
            riskRating: e.sponsorReferences.riskRating,
            verificationStatus: e.sponsorReferences.verificationStatus,
          }
        : null,
    });
  }

  static toOrm(domain: Asset): AssetOrmEntity {
    const e = new AssetOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.name = domain.name;
    e.assetClass = domain.assetClass;
    e.sponsorId = domain.sponsorId;
    e.status = domain.status;
    e.jurisdictions = domain.jurisdictions;
    e.purchasePriceAmount = domain.purchasePrice ? domain.purchasePrice.amount.toString() : null;
    e.purchasePriceCurrency = domain.purchasePrice ? domain.purchasePrice.currency : null;
    e.collateral = domain.collateral.map((c) => ({
      type: c.type,
      description: c.description,
      estimatedValue: {
        amountMinorUnits: c.estimatedValue.amount.toString(),
        currency: c.estimatedValue.currency,
      },
      lienPosition: c.lienPosition,
    }));
    e.provenance = domain.provenance.map((p) => ({
      sourceType: p.sourceType,
      sourceRef: p.sourceRef,
      documentedAt: p.documentedAt.toIso(),
      priorOwners: p.priorOwners,
    }));
    e.valuationFairValue = domain.valuation?.fairValueMinorUnits ?? null;
    e.valuationCurrency = domain.valuation?.currency ?? null;
    e.valuationMethodology = domain.valuation?.methodology ?? null;
    e.valuationValuedAt = domain.valuation?.valuedAt ?? null;
    e.dueDiligenceRating = domain.dueDiligenceRating;
    e.approvedBy = domain.approvedBy;
    e.rejectionReason = domain.rejectionReason;
    e.version = domain.version;
    // Map sponsor reference if present
    if (domain.sponsorReference) {
      const refOrm = new SponsorReferenceOrmEntity();
      refOrm.id = domain.sponsorReference.id;
      refOrm.entityId = domain.id.value;
      refOrm.tenantId = domain.tenantId.value;
      refOrm.name = domain.sponsorReference.name;
      refOrm.jurisdiction = domain.sponsorReference.jurisdiction;
      refOrm.relationshipStatus = domain.sponsorReference.relationshipStatus;
      refOrm.riskRating = domain.sponsorReference.riskRating;
      refOrm.verificationStatus = domain.sponsorReference.verificationStatus;
      e.sponsorReferences = refOrm;
    }
    return e;
  }
}
