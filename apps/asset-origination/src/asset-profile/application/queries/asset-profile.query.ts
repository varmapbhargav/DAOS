import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  ASSET_CLAIM_REPOSITORY,
  ASSET_COUNTERPARTY_REPOSITORY,
  ASSET_ENCUMBRANCE_REPOSITORY,
  ASSET_PROVENANCE_REPOSITORY,
  ASSET_RIGHTS_REPOSITORY,
  ASSET_TRANSFERABILITY_REPOSITORY,
  DATA_REQUEST_REPOSITORY,
  EVIDENCE_REPOSITORY,
  OWNERSHIP_REPOSITORY,
} from '../../../domain/repositories/repository.tokens';
import { AssetCounterparty } from '../../domain/entities/asset-counterparty.entity';
import { Evidence } from '../../domain/entities/evidence.entity';
import { AssetClaimRepository } from '../../domain/repositories/asset-claim.repository';
import { AssetCounterpartyRepository } from '../../domain/repositories/asset-counterparty.repository';
import { AssetEncumbranceRepository } from '../../domain/repositories/asset-encumbrance.repository';
import { AssetProvenanceRepository } from '../../domain/repositories/asset-provenance.repository';
import { AssetRightsRepository } from '../../domain/repositories/asset-rights.repository';
import { AssetTransferabilityRepository } from '../../domain/repositories/asset-transferability.repository';
import { DataRequestRepository } from '../../domain/repositories/data-request.repository';
import { EvidenceRepository } from '../../domain/repositories/evidence.repository';
import { OwnershipRepository } from '../../domain/repositories/ownership.repository';

export class ListCounterpartiesByAssetQuery {
  constructor(public readonly assetId: string) {}
}
export class ListOwnershipByAssetQuery {
  constructor(public readonly assetId: string) {}
}
export class ListRightsByAssetQuery {
  constructor(public readonly assetId: string) {}
}
export class ListEncumbrancesByAssetQuery {
  constructor(public readonly assetId: string) {}
}
export class GetTransferabilityByAssetQuery {
  constructor(public readonly assetId: string) {}
}
export class ListProvenanceByAssetQuery {
  constructor(public readonly assetId: string) {}
}
export class ListEvidenceByAssetQuery {
  constructor(public readonly assetId: string) {}
}
export class ListEvidenceByCaseQuery {
  constructor(public readonly caseId: string) {}
}
export class ListClaimsByAssetQuery {
  constructor(public readonly assetId: string) {}
}
export class ListDataRequestsByCaseQuery {
  constructor(public readonly caseId: string) {}
}

@QueryHandler(ListCounterpartiesByAssetQuery)
export class ListCounterpartiesByAssetHandler implements IQueryHandler<ListCounterpartiesByAssetQuery, object[]> {
  constructor(@Inject(ASSET_COUNTERPARTY_REPOSITORY) private readonly repo: AssetCounterpartyRepository) {}
  async execute(q: ListCounterpartiesByAssetQuery): Promise<object[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    return (await this.repo.findByAssetId(tenantId, q.assetId)).map((e) => this.toDto(e));
  }
  private toDto(e: AssetCounterparty): object {
    return {
      id: e.id.value,
      assetId: e.assetId,
      entityId: e.entityId,
      personId: e.personId,
      counterpartyType: e.counterpartyType,
      role: e.role,
      legalRole: e.legalRole,
      economicRole: e.economicRole,
      ownershipPercentage: e.ownershipPercentage,
      effectiveFrom: e.effectiveFrom,
      effectiveTo: e.effectiveTo,
      verificationStatus: e.verificationStatus,
      complianceStatus: e.complianceStatus,
    };
  }
}

@QueryHandler(ListOwnershipByAssetQuery)
export class ListOwnershipByAssetHandler implements IQueryHandler<ListOwnershipByAssetQuery, object[]> {
  constructor(@Inject(OWNERSHIP_REPOSITORY) private readonly repo: OwnershipRepository) {}
  async execute(q: ListOwnershipByAssetQuery): Promise<object[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    return (await this.repo.findByAssetId(tenantId, q.assetId)).map((e) => ({
      id: e.id.value,
      assetId: e.assetId,
      entityId: e.entityId,
      personId: e.personId,
      ownershipType: e.ownershipType,
      ownershipPercentage: e.ownershipPercentage,
      economicInterestPercentage: e.economicInterestPercentage,
      controlPercentage: e.controlPercentage,
      acquisitionDate: e.acquisitionDate,
      effectiveFrom: e.effectiveFrom,
      effectiveTo: e.effectiveTo,
      verificationStatus: e.verificationStatus,
      verifiedBy: e.verifiedBy,
      verifiedAt: e.verifiedAt,
      notes: e.notes,
    }));
  }
}

@QueryHandler(ListRightsByAssetQuery)
export class ListRightsByAssetHandler implements IQueryHandler<ListRightsByAssetQuery, object[]> {
  constructor(@Inject(ASSET_RIGHTS_REPOSITORY) private readonly repo: AssetRightsRepository) {}
  async execute(q: ListRightsByAssetQuery): Promise<object[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    return (await this.repo.findByAssetId(tenantId, q.assetId)).map((e) => ({
      id: e.id.value,
      assetId: e.assetId,
      rightType: e.rightType,
      holderEntityId: e.holderEntityId,
      holderPersonId: e.holderPersonId,
      percentage: e.percentage,
      priority: e.priority,
      effectiveFrom: e.effectiveFrom,
      effectiveTo: e.effectiveTo,
      transferable: e.transferable,
      assignable: e.assignable,
    }));
  }
}

@QueryHandler(ListEncumbrancesByAssetQuery)
export class ListEncumbrancesByAssetHandler implements IQueryHandler<ListEncumbrancesByAssetQuery, object[]> {
  constructor(@Inject(ASSET_ENCUMBRANCE_REPOSITORY) private readonly repo: AssetEncumbranceRepository) {}
  async execute(q: ListEncumbrancesByAssetQuery): Promise<object[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    return (await this.repo.findByAssetId(tenantId, q.assetId)).map((e) => ({
      id: e.id.value,
      assetId: e.assetId,
      type: e.type,
      holderEntityId: e.holderEntityId,
      amountMinorUnits: e.amountMinorUnits,
      currency: e.currency,
      priority: e.priority,
      registrationNumber: e.registrationNumber,
      effectiveFrom: e.effectiveFrom,
      effectiveTo: e.effectiveTo,
      status: e.status,
      releaseConditions: e.releaseConditions,
      verificationStatus: e.verificationStatus,
    }));
  }
}

@QueryHandler(GetTransferabilityByAssetQuery)
export class GetTransferabilityByAssetHandler implements IQueryHandler<GetTransferabilityByAssetQuery, object | null> {
  constructor(@Inject(ASSET_TRANSFERABILITY_REPOSITORY) private readonly repo: AssetTransferabilityRepository) {}
  async execute(q: GetTransferabilityByAssetQuery): Promise<object | null> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = await this.repo.findByAssetId(tenantId, q.assetId);
    if (!e) return null;
    return {
      assetId: e.assetId,
      transferable: e.transferable,
      assignable: e.assignable,
      fractionalizable: e.fractionalizable,
      tokenizable: e.tokenizable,
      issuerConsentRequired: e.issuerConsentRequired,
      ownerConsentRequired: e.ownerConsentRequired,
      regulatorApprovalRequired: e.regulatorApprovalRequired,
      geographicRestrictions: e.geographicRestrictions,
      investorRestrictions: e.investorRestrictions,
      lockupDays: e.lockupDays,
      status: e.status,
      reviewDecision: e.reviewDecision,
      reviewer: e.reviewer,
      assessmentDate: e.assessmentDate,
      notes: e.notes,
    };
  }
}

@QueryHandler(ListProvenanceByAssetQuery)
export class ListProvenanceByAssetHandler implements IQueryHandler<ListProvenanceByAssetQuery, object[]> {
  constructor(@Inject(ASSET_PROVENANCE_REPOSITORY) private readonly repo: AssetProvenanceRepository) {}
  async execute(q: ListProvenanceByAssetQuery): Promise<object[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    return (await this.repo.findByAssetId(tenantId, q.assetId)).map((e) => ({
      id: e.id.value,
      assetId: e.assetId,
      eventType: e.eventType,
      fromEntityId: e.fromEntityId,
      toEntityId: e.toEntityId,
      effectiveDate: e.effectiveDate,
      recordedDate: e.recordedDate,
      jurisdiction: e.jurisdiction,
      registryReference: e.registryReference,
      documentReference: e.documentReference,
      transactionReference: e.transactionReference,
      verificationStatus: e.verificationStatus,
      hash: e.hash,
    }));
  }
}

@QueryHandler(ListEvidenceByAssetQuery)
export class ListEvidenceByAssetHandler implements IQueryHandler<ListEvidenceByAssetQuery, object[]> {
  constructor(@Inject(EVIDENCE_REPOSITORY) private readonly repo: EvidenceRepository) {}
  async execute(q: ListEvidenceByAssetQuery): Promise<object[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    return (await this.repo.findByAssetId(tenantId, q.assetId)).map((e) => this.toEvidenceDto(e));
  }
  private toEvidenceDto(e: Evidence): object {
    return {
      id: e.id.value,
      assetId: e.assetId,
      caseId: e.caseId,
      evidenceType: e.evidenceType,
      source: e.source,
      sourceReference: e.sourceReference,
      evidenceDate: e.evidenceDate,
      collectedAt: e.collectedAt,
      collectedBy: e.collectedBy,
      confidence: e.confidence,
      verificationStatus: e.verificationStatus,
      documentId: e.documentId,
      externalReference: e.externalReference,
      hash: e.hash,
      expiry: e.expiry,
    };
  }
}

@QueryHandler(ListEvidenceByCaseQuery)
export class ListEvidenceByCaseHandler implements IQueryHandler<ListEvidenceByCaseQuery, object[]> {
  constructor(@Inject(EVIDENCE_REPOSITORY) private readonly repo: EvidenceRepository) {}
  async execute(q: ListEvidenceByCaseQuery): Promise<object[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    return (await this.repo.findByCaseId(tenantId, q.caseId)).map((e) => ({
      id: e.id.value,
      assetId: e.assetId,
      caseId: e.caseId,
      evidenceType: e.evidenceType,
      source: e.source,
      verificationStatus: e.verificationStatus,
    }));
  }
}

@QueryHandler(ListClaimsByAssetQuery)
export class ListClaimsByAssetHandler implements IQueryHandler<ListClaimsByAssetQuery, object[]> {
  constructor(@Inject(ASSET_CLAIM_REPOSITORY) private readonly repo: AssetClaimRepository) {}
  async execute(q: ListClaimsByAssetQuery): Promise<object[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    return (await this.repo.findByAssetId(tenantId, q.assetId)).map((e) => ({
      id: e.id.value,
      assetId: e.assetId,
      claimStatement: e.claimStatement,
      claimType: e.claimType,
      claimOwner: e.claimOwner,
      materiality: e.materiality,
      status: e.status,
      confidence: e.confidence,
      verifiedAt: e.verifiedAt,
    }));
  }
}

@QueryHandler(ListDataRequestsByCaseQuery)
export class ListDataRequestsByCaseHandler implements IQueryHandler<ListDataRequestsByCaseQuery, object[]> {
  constructor(@Inject(DATA_REQUEST_REPOSITORY) private readonly repo: DataRequestRepository) {}
  async execute(q: ListDataRequestsByCaseQuery): Promise<object[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    return (await this.repo.findByCaseId(tenantId, q.caseId)).map((e) => ({
      id: e.id.value,
      caseId: e.caseId,
      requestedFrom: e.requestedFrom,
      requestedBy: e.requestedBy,
      requestType: e.requestType,
      description: e.description,
      priority: e.priority,
      requiredBy: e.requiredBy,
      status: e.status,
      response: e.response,
    }));
  }
}
