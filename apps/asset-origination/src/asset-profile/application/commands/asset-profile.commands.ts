import {
  ClaimId,
  CounterpartyId,
  DataRequestId,
  EncumbranceId,
  OwnershipId,
  TenantContextHolder,
  TenantId,
  VerificationMethod,
} from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
import { AssetClaim, ClaimMateriality } from '../../domain/entities/asset-claim.entity';
import { AssetCounterparty } from '../../domain/entities/asset-counterparty.entity';
import { AssetEncumbrance } from '../../domain/entities/asset-encumbrance.entity';
import { AssetProvenance } from '../../domain/entities/asset-provenance.entity';
import { AssetRights } from '../../domain/entities/asset-rights.entity';
import { AssetTransferability } from '../../domain/entities/asset-transferability.entity';
import { DataRequest } from '../../domain/entities/data-request.entity';
import { Evidence } from '../../domain/entities/evidence.entity';
import { Ownership } from '../../domain/entities/ownership.entity';
import { AssetClaimRepository } from '../../domain/repositories/asset-claim.repository';
import { AssetCounterpartyRepository } from '../../domain/repositories/asset-counterparty.repository';
import { AssetEncumbranceRepository } from '../../domain/repositories/asset-encumbrance.repository';
import { AssetProvenanceRepository } from '../../domain/repositories/asset-provenance.repository';
import { AssetRightsRepository } from '../../domain/repositories/asset-rights.repository';
import { AssetTransferabilityRepository } from '../../domain/repositories/asset-transferability.repository';
import { DataRequestRepository } from '../../domain/repositories/data-request.repository';
import { EvidenceRepository } from '../../domain/repositories/evidence.repository';
import { OwnershipRepository } from '../../domain/repositories/ownership.repository';
import {
  CompleteTransferabilityAssessmentDto,
  CreateClaimDto,
  CreateCounterpartyDto,
  CreateDataRequestDto,
  CreateEncumbranceDto,
  CreateEvidenceDto,
  CreateOwnershipDto,
  CreateProvenanceEventDto,
  CreateRightsDto,
  CreateTransferabilityDto,
  RejectClaimDto,
  RespondToDataRequestDto,
  VerifyClaimDto,
  VerifyCounterpartyDto,
  VerifyOwnershipDto,
} from '../dto/asset-profile.dto';

// ---------------------------------------------------------------------------
// Counterparty
// ---------------------------------------------------------------------------

export class CreateCounterpartyCommand {
  constructor(public readonly dto: CreateCounterpartyDto) {}
}
export class VerifyCounterpartyCommand {
  constructor(public readonly id: string, public readonly dto: VerifyCounterpartyDto) {}
}

@CommandHandler(CreateCounterpartyCommand)
export class CreateCounterpartyHandler implements ICommandHandler<CreateCounterpartyCommand, { id: string }> {
  constructor(@Inject(ASSET_COUNTERPARTY_REPOSITORY) private readonly repo: AssetCounterpartyRepository) {}

  async execute(command: CreateCounterpartyCommand): Promise<{ id: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = AssetCounterparty.create({
      tenantId,
      assetId: dto.assetId,
      entityId: dto.entityId,
      personId: dto.personId,
      counterpartyType: dto.counterpartyType,
      role: dto.role as AssetCounterparty['role'],
      legalRole: dto.legalRole,
      economicRole: dto.economicRole,
      ownershipPercentage: dto.ownershipPercentage,
      effectiveFrom: dto.effectiveFrom,
      effectiveTo: dto.effectiveTo,
    });
    await this.repo.save(e);
    return { id: e.id.value };
  }
}

@CommandHandler(VerifyCounterpartyCommand)
export class VerifyCounterpartyHandler implements ICommandHandler<VerifyCounterpartyCommand, void> {
  constructor(@Inject(ASSET_COUNTERPARTY_REPOSITORY) private readonly repo: AssetCounterpartyRepository) {}

  async execute(command: VerifyCounterpartyCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = await this.repo.findById(tenantId, CounterpartyId.create(command.id));
    if (!e) throw new Error('Counterparty not found');
    e.verify(command.dto.status as AssetCounterparty['verificationStatus']);
    await this.repo.save(e);
  }
}

// ---------------------------------------------------------------------------
// Ownership
// ---------------------------------------------------------------------------

export class CreateOwnershipCommand {
  constructor(public readonly dto: CreateOwnershipDto) {}
}
export class VerifyOwnershipCommand {
  constructor(public readonly id: string, public readonly dto: VerifyOwnershipDto) {}
}

@CommandHandler(CreateOwnershipCommand)
export class CreateOwnershipHandler implements ICommandHandler<CreateOwnershipCommand, { id: string }> {
  constructor(@Inject(OWNERSHIP_REPOSITORY) private readonly repo: OwnershipRepository) {}

  async execute(command: CreateOwnershipCommand): Promise<{ id: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = Ownership.create({
      tenantId,
      assetId: dto.assetId,
      entityId: dto.entityId,
      personId: dto.personId,
      ownershipType: dto.ownershipType as Ownership['ownershipType'],
      ownershipPercentage: dto.ownershipPercentage,
      economicInterestPercentage: dto.economicInterestPercentage,
      controlPercentage: dto.controlPercentage,
      acquisitionDate: dto.acquisitionDate,
      effectiveFrom: dto.effectiveFrom,
      effectiveTo: dto.effectiveTo,
      notes: dto.notes,
    });
    await this.repo.save(e);
    return { id: e.id.value };
  }
}

@CommandHandler(VerifyOwnershipCommand)
export class VerifyOwnershipHandler implements ICommandHandler<VerifyOwnershipCommand, void> {
  constructor(@Inject(OWNERSHIP_REPOSITORY) private readonly repo: OwnershipRepository) {}

  async execute(command: VerifyOwnershipCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = await this.repo.findById(tenantId, OwnershipId.create(command.id));
    if (!e) throw new Error('Ownership not found');
    if (command.dto.status === 'VERIFIED') {
      e.verify(TenantContextHolder.get().userId ?? tenantId.value);
    } else if (command.dto.status === 'REJECTED') {
      e.reject(TenantContextHolder.get().userId ?? tenantId.value);
    } else {
      e.expire();
    }
    await this.repo.save(e);
  }
}

// ---------------------------------------------------------------------------
// Rights
// ---------------------------------------------------------------------------

export class CreateRightsCommand {
  constructor(public readonly dto: CreateRightsDto) {}
}

@CommandHandler(CreateRightsCommand)
export class CreateRightsHandler implements ICommandHandler<CreateRightsCommand, { id: string }> {
  constructor(@Inject(ASSET_RIGHTS_REPOSITORY) private readonly repo: AssetRightsRepository) {}

  async execute(command: CreateRightsCommand): Promise<{ id: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = AssetRights.create({
      tenantId,
      assetId: dto.assetId,
      rightType: dto.rightType as AssetRights['rightType'],
      holderEntityId: dto.holderEntityId,
      holderPersonId: dto.holderPersonId,
      percentage: dto.percentage,
      priority: dto.priority,
      effectiveFrom: dto.effectiveFrom,
      effectiveTo: dto.effectiveTo,
      transferable: dto.transferable,
      assignable: dto.assignable,
    });
    await this.repo.save(e);
    return { id: e.id.value };
  }
}

// ---------------------------------------------------------------------------
// Encumbrance
// ---------------------------------------------------------------------------

export class CreateEncumbranceCommand {
  constructor(public readonly dto: CreateEncumbranceDto) {}
}
export class ReleaseEncumbranceCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(CreateEncumbranceCommand)
export class CreateEncumbranceHandler implements ICommandHandler<CreateEncumbranceCommand, { id: string }> {
  constructor(@Inject(ASSET_ENCUMBRANCE_REPOSITORY) private readonly repo: AssetEncumbranceRepository) {}

  async execute(command: CreateEncumbranceCommand): Promise<{ id: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = AssetEncumbrance.create({
      tenantId,
      assetId: dto.assetId,
      type: dto.type as AssetEncumbrance['type'],
      holderEntityId: dto.holderEntityId,
      amountMinorUnits: dto.amountMinorUnits,
      currency: dto.currency,
      priority: dto.priority,
      registrationNumber: dto.registrationNumber,
      effectiveFrom: dto.effectiveFrom,
      effectiveTo: dto.effectiveTo,
      releaseConditions: dto.releaseConditions,
    });
    await this.repo.save(e);
    return { id: e.id.value };
  }
}

@CommandHandler(ReleaseEncumbranceCommand)
export class ReleaseEncumbranceHandler implements ICommandHandler<ReleaseEncumbranceCommand, void> {
  constructor(@Inject(ASSET_ENCUMBRANCE_REPOSITORY) private readonly repo: AssetEncumbranceRepository) {}

  async execute(command: ReleaseEncumbranceCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = await this.repo.findById(tenantId, EncumbranceId.create(command.id));
    if (!e) throw new Error('Encumbrance not found');
    e.release();
    await this.repo.save(e);
  }
}

// ---------------------------------------------------------------------------
// Transferability
// ---------------------------------------------------------------------------

export class CreateTransferabilityCommand {
  constructor(public readonly dto: CreateTransferabilityDto) {}
}
export class CompleteTransferabilityAssessmentCommand {
  constructor(public readonly assetId: string, public readonly dto: CompleteTransferabilityAssessmentDto) {}
}

@CommandHandler(CreateTransferabilityCommand)
export class CreateTransferabilityHandler implements ICommandHandler<CreateTransferabilityCommand, { assetId: string }> {
  constructor(@Inject(ASSET_TRANSFERABILITY_REPOSITORY) private readonly repo: AssetTransferabilityRepository) {}

  async execute(command: CreateTransferabilityCommand): Promise<{ assetId: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = AssetTransferability.create({
      tenantId,
      assetId: dto.assetId,
      transferable: dto.transferable,
      assignable: dto.assignable,
      fractionalizable: dto.fractionalizable,
      tokenizable: dto.tokenizable,
      beneficialInterestTransferable: dto.beneficialInterestTransferable,
      issuerConsentRequired: dto.issuerConsentRequired,
      ownerConsentRequired: dto.ownerConsentRequired,
      regulatorApprovalRequired: dto.regulatorApprovalRequired,
      geographicRestrictions: dto.geographicRestrictions,
      investorRestrictions: dto.investorRestrictions,
      lockupDays: dto.lockupDays,
      preEmptionRights: dto.preEmptionRights,
      legalOpinionRequired: dto.legalOpinionRequired,
    });
    await this.repo.save(e);
    return { assetId: e.assetId };
  }
}

@CommandHandler(CompleteTransferabilityAssessmentCommand)
export class CompleteTransferabilityAssessmentHandler
  implements ICommandHandler<CompleteTransferabilityAssessmentCommand, void>
{
  constructor(@Inject(ASSET_TRANSFERABILITY_REPOSITORY) private readonly repo: AssetTransferabilityRepository) {}

  async execute(command: CompleteTransferabilityAssessmentCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = await this.repo.findByAssetId(tenantId, command.assetId);
    if (!e) throw new Error('Transferability not found');
    e.completeAssessment(
      command.dto.reviewer,
      command.dto.decision as NonNullable<AssetTransferability['reviewDecision']>,
      command.dto.notes,
    );
    await this.repo.save(e);
  }
}

// ---------------------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------------------

export class CreateProvenanceEventCommand {
  constructor(public readonly dto: CreateProvenanceEventDto) {}
}

@CommandHandler(CreateProvenanceEventCommand)
export class CreateProvenanceEventHandler implements ICommandHandler<CreateProvenanceEventCommand, { id: string }> {
  constructor(@Inject(ASSET_PROVENANCE_REPOSITORY) private readonly repo: AssetProvenanceRepository) {}

  async execute(command: CreateProvenanceEventCommand): Promise<{ id: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = AssetProvenance.create({
      tenantId,
      assetId: dto.assetId,
      eventType: dto.eventType as AssetProvenance['eventType'],
      fromEntityId: dto.fromEntityId,
      toEntityId: dto.toEntityId,
      effectiveDate: dto.effectiveDate,
      jurisdiction: dto.jurisdiction,
      registryReference: dto.registryReference,
      documentReference: dto.documentReference,
      transactionReference: dto.transactionReference,
      hash: dto.hash,
    });
    await this.repo.save(e);
    return { id: e.id.value };
  }
}

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export class CreateEvidenceCommand {
  constructor(public readonly dto: CreateEvidenceDto) {}
}

@CommandHandler(CreateEvidenceCommand)
export class CreateEvidenceHandler implements ICommandHandler<CreateEvidenceCommand, { id: string }> {
  constructor(@Inject(EVIDENCE_REPOSITORY) private readonly repo: EvidenceRepository) {}

  async execute(command: CreateEvidenceCommand): Promise<{ id: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = Evidence.create({
      tenantId,
      assetId: dto.assetId,
      caseId: dto.caseId,
      evidenceType: dto.evidenceType as Evidence['evidenceType'],
      source: dto.source,
      sourceReference: dto.sourceReference,
      evidenceDate: dto.evidenceDate,
      collectedBy: dto.collectedBy,
      confidence: dto.confidence,
      documentId: dto.documentId,
      externalReference: dto.externalReference,
      hash: dto.hash,
      signature: dto.signature,
      expiry: dto.expiry,
      accessPolicy: dto.accessPolicy,
    });
    await this.repo.save(e);
    return { id: e.id.value };
  }
}

// ---------------------------------------------------------------------------
// Claims
// ---------------------------------------------------------------------------

export class CreateClaimCommand {
  constructor(public readonly dto: CreateClaimDto) {}
}
export class VerifyClaimCommand {
  constructor(public readonly id: string, public readonly dto: VerifyClaimDto) {}
}
export class RejectClaimCommand {
  constructor(public readonly id: string, public readonly dto: RejectClaimDto) {}
}

@CommandHandler(CreateClaimCommand)
export class CreateClaimHandler implements ICommandHandler<CreateClaimCommand, { id: string }> {
  constructor(@Inject(ASSET_CLAIM_REPOSITORY) private readonly repo: AssetClaimRepository) {}

  async execute(command: CreateClaimCommand): Promise<{ id: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = AssetClaim.create({
      tenantId,
      assetId: dto.assetId,
      claimStatement: dto.claimStatement,
      claimType: dto.claimType as AssetClaim['claimType'],
      claimOwner: dto.claimOwner,
      materiality: dto.materiality as ClaimMateriality,
    });
    await this.repo.save(e);
    return { id: e.id.value };
  }
}

@CommandHandler(VerifyClaimCommand)
export class VerifyClaimHandler implements ICommandHandler<VerifyClaimCommand, void> {
  constructor(@Inject(ASSET_CLAIM_REPOSITORY) private readonly repo: AssetClaimRepository) {}

  async execute(command: VerifyClaimCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = await this.repo.findById(tenantId, ClaimId.create(command.id));
    if (!e) throw new Error('Claim not found');
    e.verify({
      verifier: command.dto.verifier,
      method: command.dto.method as VerificationMethod,
      confidence: command.dto.confidence,
    });
    await this.repo.save(e);
  }
}

@CommandHandler(RejectClaimCommand)
export class RejectClaimHandler implements ICommandHandler<RejectClaimCommand, void> {
  constructor(@Inject(ASSET_CLAIM_REPOSITORY) private readonly repo: AssetClaimRepository) {}

  async execute(command: RejectClaimCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = await this.repo.findById(tenantId, ClaimId.create(command.id));
    if (!e) throw new Error('Claim not found');
    e.reject(command.dto.reviewer, command.dto.reason);
    await this.repo.save(e);
  }
}

// ---------------------------------------------------------------------------
// Data Requests
// ---------------------------------------------------------------------------

export class CreateDataRequestCommand {
  constructor(public readonly dto: CreateDataRequestDto) {}
}
export class RespondToDataRequestCommand {
  constructor(public readonly id: string, public readonly dto: RespondToDataRequestDto) {}
}

@CommandHandler(CreateDataRequestCommand)
export class CreateDataRequestHandler implements ICommandHandler<CreateDataRequestCommand, { id: string }> {
  constructor(@Inject(DATA_REQUEST_REPOSITORY) private readonly repo: DataRequestRepository) {}

  async execute(command: CreateDataRequestCommand): Promise<{ id: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = DataRequest.create({
      tenantId,
      caseId: dto.caseId,
      requestedFrom: dto.requestedFrom,
      requestedBy: dto.requestedBy,
      requestType: dto.requestType as DataRequest['requestType'],
      description: dto.description,
      priority: dto.priority,
      requiredBy: dto.requiredBy,
    });
    await this.repo.save(e);
    return { id: e.id.value };
  }
}

@CommandHandler(RespondToDataRequestCommand)
export class RespondToDataRequestHandler implements ICommandHandler<RespondToDataRequestCommand, void> {
  constructor(@Inject(DATA_REQUEST_REPOSITORY) private readonly repo: DataRequestRepository) {}

  async execute(command: RespondToDataRequestCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const e = await this.repo.findById(tenantId, DataRequestId.create(command.id));
    if (!e) throw new Error('Data request not found');
    e.receive(command.dto.response, command.dto.evidenceReferences);
    await this.repo.save(e);
  }
}
