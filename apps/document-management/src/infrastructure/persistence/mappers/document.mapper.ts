import {
  DocumentCategory,
  DocumentId,
  DocumentStatus,
  DocumentVersionId,
  EntityReference,
  TenantId,
} from '@daos/shared-kernel';

import { Document } from '../../../domain/aggregates/document.aggregate';
import { DocumentVersion } from '../../../domain/entities/document-version.entity';
import { DocumentOrmEntity } from '../entities/document.orm-entity';
import { DocumentVersionOrmRow } from '../entities/document-version.orm-row';

export class DocumentMapper {
  static toOrm(document: Document): Partial<DocumentOrmEntity> {
    return {
      id: document.id.value,
      tenantId: document.tenantId.value,
      fileName: document.fileName,
      category: document.category,
      entityRef: document.entityRef as object,
      status: document.status,
      currentVersionNumber: document.currentVersionNumber,
      versions: document.versions.map(toVersionRow) as object,
      uploadedBy: document.uploadedBy,
      uploadedAt: new Date(document.uploadedAt),
      version: document.version,
    };
  }

  static toDomain(e: DocumentOrmEntity): Document {
    const versions = ((e.versions as DocumentVersionOrmRow[]) ?? []).map(
      (row) =>
        DocumentVersion.reconstruct({
          id: DocumentVersionId.create(row.id),
          documentId: row.documentId,
          versionNumber: row.versionNumber,
          fileRef: row.fileRef,
          storageKey: row.storageKey,
          checksum: row.checksum,
          contentType: row.contentType,
          sizeBytes: row.sizeBytes,
          uploadedBy: row.uploadedBy,
          uploadedAt: row.uploadedAt,
          version: row.version,
        }),
    );
    return Document.reconstruct({
      id: DocumentId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      fileName: e.fileName,
      category: e.category as DocumentCategory,
      entityRef: (e.entityRef ?? { entityType: 'issuance', entityId: '' }) as EntityReference,
      status: e.status as DocumentStatus,
      currentVersionNumber: e.currentVersionNumber,
      versions,
      uploadedBy: e.uploadedBy,
      uploadedAt: e.uploadedAt.toISOString(),
      version: e.version,
    });
  }
}

function toVersionRow(version: DocumentVersion): DocumentVersionOrmRow {
  return {
    id: version.id.value,
    documentId: version.documentId,
    versionNumber: version.versionNumber,
    fileRef: version.fileRef,
    storageKey: version.storageKey,
    checksum: version.checksum,
    contentType: version.contentType,
    sizeBytes: version.sizeBytes,
    uploadedBy: version.uploadedBy,
    uploadedAt: version.uploadedAt,
    version: version.version,
  };
}