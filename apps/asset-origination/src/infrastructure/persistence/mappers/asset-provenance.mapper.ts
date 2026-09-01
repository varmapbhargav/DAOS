import { ProvenanceEventId, ProvenanceEventType, ProvenanceVerificationStatus, TenantId } from '@daos/shared-kernel';

import { AssetProvenance } from '../../../domain/entities/asset-provenance.entity';
import { AssetProvenanceOrmEntity } from '../entities/asset-provenance.orm-entity';

export class AssetProvenanceMapper {
  static toDomain(e: AssetProvenanceOrmEntity): AssetProvenance {
    return AssetProvenance.reconstruct({
      id: ProvenanceEventId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      assetId: e.assetId,
      eventType: e.eventType as ProvenanceEventType,
      fromEntityId: e.fromEntityId,
      toEntityId: e.toEntityId,
      effectiveDate: e.effectiveDate,
      recordedDate: e.recordedDate,
      jurisdiction: e.jurisdiction,
      registryReference: e.registryReference,
      documentReference: e.documentReference,
      transactionReference: e.transactionReference,
      verificationStatus: e.verificationStatus as ProvenanceVerificationStatus,
      evidenceReferences: e.evidenceReferences ?? [],
      hash: e.hash,
    });
  }

  static toOrm(domain: AssetProvenance): AssetProvenanceOrmEntity {
    const e = new AssetProvenanceOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.assetId = domain.assetId;
    e.eventType = domain.eventType;
    e.fromEntityId = domain.fromEntityId;
    e.toEntityId = domain.toEntityId;
    e.effectiveDate = domain.effectiveDate;
    e.recordedDate = domain.recordedDate;
    e.jurisdiction = domain.jurisdiction;
    e.registryReference = domain.registryReference;
    e.documentReference = domain.documentReference;
    e.transactionReference = domain.transactionReference;
    e.verificationStatus = domain.verificationStatus;
    e.evidenceReferences = domain.evidenceReferences;
    e.hash = domain.hash;
    return e;
  }
}
