import { EvidenceId, EvidenceType, EvidenceVerificationStatus, TenantId } from '@daos/shared-kernel';

import { Evidence } from '../../../domain/entities/evidence.entity';
import { EvidenceOrmEntity } from '../entities/evidence.orm-entity';

export class EvidenceMapper {
  static toDomain(e: EvidenceOrmEntity): Evidence {
    return Evidence.reconstruct({
      id: EvidenceId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      assetId: e.assetId,
      caseId: e.caseId,
      evidenceType: e.evidenceType as EvidenceType,
      source: e.source,
      sourceReference: e.sourceReference,
      evidenceDate: e.evidenceDate,
      collectedAt: e.collectedAt,
      collectedBy: e.collectedBy,
      confidence: e.confidence,
      verificationStatus: e.verificationStatus as EvidenceVerificationStatus,
      documentId: e.documentId,
      externalReference: e.externalReference,
      hash: e.hash,
      signature: e.signature,
      expiry: e.expiry,
      accessPolicy: e.accessPolicy,
    });
  }

  static toOrm(domain: Evidence): EvidenceOrmEntity {
    const e = new EvidenceOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.assetId = domain.assetId;
    e.caseId = domain.caseId;
    e.evidenceType = domain.evidenceType;
    e.source = domain.source;
    e.sourceReference = domain.sourceReference;
    e.evidenceDate = domain.evidenceDate;
    e.collectedAt = domain.collectedAt;
    e.collectedBy = domain.collectedBy;
    e.confidence = domain.confidence;
    e.verificationStatus = domain.verificationStatus;
    e.documentId = domain.documentId;
    e.externalReference = domain.externalReference;
    e.hash = domain.hash;
    e.signature = domain.signature;
    e.expiry = domain.expiry;
    e.accessPolicy = domain.accessPolicy;
    return e;
  }
}
