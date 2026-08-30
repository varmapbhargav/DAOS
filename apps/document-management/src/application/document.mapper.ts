import { DocumentCategory, DocumentStatus, EntityReference } from '@daos/shared-kernel';

import { Document } from '../domain/aggregates/document.aggregate';
import { DocumentVersion } from '../domain/entities/document-version.entity';

export interface DocumentVersionDto {
  id: string;
  documentId: string;
  versionNumber: number;
  fileRef: string;
  storageKey: string;
  checksum: string;
  contentType: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
}

export interface DocumentDto {
  id: string;
  tenantId: string;
  fileName: string;
  category: DocumentCategory;
  entityRef: EntityReference;
  status: DocumentStatus;
  currentVersionNumber: number;
  versions: DocumentVersionDto[];
  uploadedBy: string;
  uploadedAt: string;
  version: number;
}

export function toDocumentVersionDto(version: DocumentVersion): DocumentVersionDto {
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

export function toDocumentDto(document: Document): DocumentDto {
  return {
    id: document.id.value,
    tenantId: document.tenantId.value,
    fileName: document.fileName,
    category: document.category,
    entityRef: document.entityRef,
    status: document.status,
    currentVersionNumber: document.currentVersionNumber,
    versions: document.versions.map(toDocumentVersionDto),
    uploadedBy: document.uploadedBy,
    uploadedAt: document.uploadedAt,
    version: document.version,
  };
}