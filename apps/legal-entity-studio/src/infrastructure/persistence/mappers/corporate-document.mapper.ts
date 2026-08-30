import { CorporateDocType, CorporateDocumentId, SignatureStatus, Signatory, TenantId } from '@daos/shared-kernel';

import { CorporateDocument } from '../../../domain/entities/corporate-document.aggregate';
import { CorporateDocumentOrmEntity } from '../entities/corporate-document.orm-entity';

export class CorporateDocumentMapper {
  static toOrm(document: CorporateDocument): Partial<CorporateDocumentOrmEntity> {
    return {
      id: document.id.value,
      tenantId: document.tenantId.value,
      entityId: document.entityId,
      docType: document.docType,
      fileRef: document.fileRef,
      status: document.status,
      signatories: document.signatories as Signatory[] as object,
      version: document.version,
    };
  }

  static toDomain(e: CorporateDocumentOrmEntity): CorporateDocument {
    return CorporateDocument.reconstruct({
      id: CorporateDocumentId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      entityId: e.entityId,
      docType: e.docType as CorporateDocType,
      fileRef: e.fileRef,
      status: (e.status as SignatureStatus) ?? 'pending',
      signatories: (e.signatories as Signatory[]) ?? [],
      createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
      version: e.version,
    });
  }
}
