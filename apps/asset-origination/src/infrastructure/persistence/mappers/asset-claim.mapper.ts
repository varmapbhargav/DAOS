import { ClaimId, ClaimStatus, ClaimTypeRule, TenantId, VerificationMethod } from '@daos/shared-kernel';

import { AssetClaim, ClaimMateriality } from '../../../domain/entities/asset-claim.entity';
import { AssetClaimOrmEntity } from '../entities/asset-claim.orm-entity';

export class AssetClaimMapper {
  static toDomain(e: AssetClaimOrmEntity): AssetClaim {
    return AssetClaim.reconstruct({
      id: ClaimId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      assetId: e.assetId,
      claimStatement: e.claimStatement,
      claimType: e.claimType as ClaimTypeRule,
      claimOwner: e.claimOwner,
      materiality: e.materiality as ClaimMateriality,
      status: e.status as ClaimStatus,
      verificationMethod: e.verificationMethod as VerificationMethod | null,
      evidenceReferences: e.evidenceReferences ?? [],
      confidence: e.confidence,
      reviewer: e.reviewer,
      verifiedAt: e.verifiedAt,
      createdAt: e.createdAt,
      rejectionReason: e.rejectionReason,
    });
  }

  static toOrm(domain: AssetClaim): AssetClaimOrmEntity {
    const e = new AssetClaimOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.assetId = domain.assetId;
    e.claimStatement = domain.claimStatement;
    e.claimType = domain.claimType;
    e.claimOwner = domain.claimOwner;
    e.materiality = domain.materiality;
    e.status = domain.status;
    e.verificationMethod = domain.verificationMethod;
    e.evidenceReferences = domain.evidenceReferences;
    e.confidence = domain.confidence;
    e.reviewer = domain.reviewer;
    e.verifiedAt = domain.verifiedAt;
    e.createdAt = domain.createdAt;
    e.rejectionReason = domain.rejectionReason;
    e.version = 0;
    return e;
  }
}
