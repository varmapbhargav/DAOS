import {
  AssetClass,
  AssetId,
  AssetOriginationStatus,
  AssetSubClass,
  Collateral,
  DDRating,
  Money,
  OriginationSource,
  ProvenanceRecord,
  TenantId,
  UtcInstant,
  ValuationMethodology,
} from '@daos/shared-kernel';

import { Asset } from '../../../domain/aggregates/asset.aggregate';
import { SponsorReference } from '../../../domain/entities/sponsor-reference.entity';
import { AssetOrmEntity } from '../entities/asset.orm-entity';

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

    const source = e.source as unknown as {
      sourceId: string;
      sourceType: string;
      sourceEntityId: string;
      sourceReference: string;
      originatedAt: string;
      submittedBy: string;
      relationshipManager: string;
    } | null;

    let sponsorReference: SponsorReference | null = null;
    if (e.sponsorReferencesId) {
      sponsorReference = SponsorReference.reconstruct({
        id: e.sponsorReferencesId,
        entityId: e.sponsorReferencesEntityId ?? e.id,
        tenantId: e.tenantId,
        name: e.sponsorReferencesName ?? '',
        jurisdiction: e.sponsorReferencesJurisdiction ?? '',
        relationshipStatus: e.sponsorReferencesRelationshipStatus ?? '',
        riskRating: e.sponsorReferencesRiskRating ?? '',
        verificationStatus: e.sponsorReferencesVerificationStatus ?? '',
      });
    }

    return Asset.reconstruct({
      id: AssetId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      name: e.name,
      assetClass: e.assetClass as AssetClass,
      assetSubClass: (e.assetSubClass ?? 'residential') as AssetSubClass,
      sponsorId: e.sponsorId,
      status: e.status as AssetOriginationStatus,
      jurisdictions: e.jurisdictions,
      country: e.country ?? '',
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
      externalReference: e.externalReference ?? null,
      internalReference: e.internalReference ?? null,
      legalName: e.legalName ?? e.name,
      source: source
        ? {
            sourceId: source.sourceId,
            sourceType: source.sourceType as OriginationSource['sourceType'],
            sourceEntityId: source.sourceEntityId,
            sourceReference: source.sourceReference,
            originatedAt: UtcInstant.fromIso(source.originatedAt),
            submittedBy: source.submittedBy,
            relationshipManager: source.relationshipManager,
          }
        : null,
      screening: null,
      qualification: null,
      sponsorReference,
    });
  }

  static toOrm(domain: Asset): AssetOrmEntity {
    const e = new AssetOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.name = domain.name;
    e.assetClass = domain.assetClass;
    e.assetSubClass = domain.assetSubClass;
    e.legalName = domain.legalName;
    e.country = domain.country;
    e.externalReference = domain.externalReference;
    e.internalReference = domain.internalReference;
    e.sponsorId = domain.sponsorId;
    e.sponsorEntityId = domain.sponsorId;
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
    e.source = domain.source
      ? {
          sourceId: domain.source.sourceId,
          sourceType: domain.source.sourceType,
          sourceEntityId: domain.source.sourceEntityId,
          sourceReference: domain.source.sourceReference,
          originatedAt: domain.source.originatedAt.toIso(),
          submittedBy: domain.source.submittedBy,
          relationshipManager: domain.source.relationshipManager,
        }
      : null;
    e.valuationFairValue = domain.valuation?.fairValueMinorUnits ?? null;
    e.valuationCurrency = domain.valuation?.currency ?? null;
    e.valuationMethodology = domain.valuation?.methodology ?? null;
    e.valuationValuedAt = domain.valuation?.valuedAt ?? null;
    e.dueDiligenceRating = domain.dueDiligenceRating;
    e.approvedBy = domain.approvedBy;
    e.rejectionReason = domain.rejectionReason;
    e.version = domain.version;
    if (domain.sponsorReference) {
      e.sponsorReferencesId = domain.sponsorReference.id;
      e.sponsorReferencesEntityId = domain.sponsorReference.entityId;
      e.sponsorReferencesName = domain.sponsorReference.name;
      e.sponsorReferencesJurisdiction = domain.sponsorReference.jurisdiction;
      e.sponsorReferencesRelationshipStatus = domain.sponsorReference.relationshipStatus;
      e.sponsorReferencesRiskRating = domain.sponsorReference.riskRating;
      e.sponsorReferencesVerificationStatus = domain.sponsorReference.verificationStatus;
    }
    return e;
  }
}
