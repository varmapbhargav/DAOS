import { TenantId, TransferabilityReviewDecision, TransferabilityStatus } from '@daos/shared-kernel';

import { AssetTransferability } from '../../../domain/entities/asset-transferability.entity';
import { AssetTransferabilityOrmEntity } from '../entities/asset-transferability.orm-entity';

export class AssetTransferabilityMapper {
  static toDomain(e: AssetTransferabilityOrmEntity): AssetTransferability {
    return AssetTransferability.reconstruct({
      id: e.id,
      tenantId: TenantId.create(e.tenantId),
      assetId: e.assetId,
      transferable: e.transferable,
      assignable: e.assignable,
      fractionalizable: e.fractionalizable,
      tokenizable: e.tokenizable,
      beneficialInterestTransferable: e.beneficialInterestTransferable,
      issuerConsentRequired: e.issuerConsentRequired,
      ownerConsentRequired: e.ownerConsentRequired,
      regulatorApprovalRequired: e.regulatorApprovalRequired,
      geographicRestrictions: e.geographicRestrictions ?? [],
      investorRestrictions: e.investorRestrictions ?? [],
      secondaryTransferRestrictions: e.secondaryTransferRestrictions ?? [],
      lockupDays: e.lockupDays,
      preEmptionRights: e.preEmptionRights,
      transferFees: e.transferFees,
      transferDocumentation: e.transferDocumentation,
      legalOpinionRequired: e.legalOpinionRequired,
      status: e.status as TransferabilityStatus,
      evidenceReferences: e.evidenceReferences ?? [],
      reviewer: e.reviewer,
      assessmentDate: e.assessmentDate,
      reviewDecision: e.reviewDecision as TransferabilityReviewDecision | null,
      notes: e.notes,
    });
  }

  static toOrm(domain: AssetTransferability): AssetTransferabilityOrmEntity {
    const e = new AssetTransferabilityOrmEntity();
    e.id = domain.id;
    e.tenantId = domain.tenantId.value;
    e.assetId = domain.assetId;
    e.transferable = domain.transferable;
    e.assignable = domain.assignable;
    e.fractionalizable = domain.fractionalizable;
    e.tokenizable = domain.tokenizable;
    e.beneficialInterestTransferable = domain.beneficialInterestTransferable;
    e.issuerConsentRequired = domain.issuerConsentRequired;
    e.ownerConsentRequired = domain.ownerConsentRequired;
    e.regulatorApprovalRequired = domain.regulatorApprovalRequired;
    e.geographicRestrictions = domain.geographicRestrictions;
    e.investorRestrictions = domain.investorRestrictions;
    e.secondaryTransferRestrictions = domain.secondaryTransferRestrictions;
    e.lockupDays = domain.lockupDays;
    e.preEmptionRights = domain.preEmptionRights;
    e.transferFees = domain.transferFees;
    e.transferDocumentation = domain.transferDocumentation;
    e.legalOpinionRequired = domain.legalOpinionRequired;
    e.status = domain.status;
    e.evidenceReferences = domain.evidenceReferences;
    e.reviewer = domain.reviewer;
    e.assessmentDate = domain.assessmentDate;
    e.reviewDecision = domain.reviewDecision;
    e.notes = domain.notes;
    return e;
  }
}
