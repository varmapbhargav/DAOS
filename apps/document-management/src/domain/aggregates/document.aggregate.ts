import {
  AggregateRoot,
  DocumentCategory,
  DocumentId,
  DocumentStatus,
  EntityReference,
  TenantId,
} from '@daos/shared-kernel';

import { DocumentVersion } from '../entities/document-version.entity';
import { DocumentUploaded } from '../events/document-uploaded.event';
import { DocumentVersionAdded } from '../events/document-version-added.event';

export type UploadDocumentParams = {
  tenantId: TenantId;
  fileName: string;
  category: DocumentCategory;
  entityRef: EntityReference;
  version: {
    fileRef: string;
    storageKey: string;
    checksum: string;
    contentType: string;
    sizeBytes: number;
    uploadedBy: string;
  };
};

export class Document extends AggregateRoot {
  private constructor(
    public readonly id: DocumentId,
    public readonly tenantId: TenantId,
    private _fileName: string,
    private _category: DocumentCategory,
    private _entityRef: EntityReference,
    private _status: DocumentStatus,
    private _currentVersionNumber: number,
    private _versions: DocumentVersion[],
    private _uploadedBy: string,
    private _uploadedAt: string,
  ) {
    super();
  }

  static upload(params: UploadDocumentParams): Document {
    if (!params.fileName.trim()) throw new Error('Document file name is required');
    if (!params.entityRef.entityId.trim()) throw new Error('Document entity reference is required');
    const document = new Document(
      DocumentId.create(),
      params.tenantId,
      params.fileName.trim(),
      params.category,
      { ...params.entityRef },
      'uploaded',
      1,
      [],
      params.version.uploadedBy,
      new Date().toISOString(),
    );
    const firstVersion = DocumentVersion.create({
      documentId: document.id.value,
      versionNumber: 1,
      fileRef: params.version.fileRef,
      storageKey: params.version.storageKey,
      checksum: params.version.checksum,
      contentType: params.version.contentType,
      sizeBytes: params.version.sizeBytes,
      uploadedBy: params.version.uploadedBy,
    });
    document._versions = [firstVersion];
    document.raise(
      new DocumentUploaded(
        document.id.value,
        document.tenantId.value,
        document._fileName,
        document._category,
        document._entityRef,
        1,
      ),
    );
    document.incrementVersion();
    return document;
  }

  addVersion(params: {
    fileRef: string;
    storageKey: string;
    checksum: string;
    contentType: string;
    sizeBytes: number;
    uploadedBy: string;
  }): DocumentVersion {
    if (this._status === 'archived') throw new Error('Archived documents cannot receive new versions');
    const nextNumber = this._currentVersionNumber + 1;
    const version = DocumentVersion.create({
      documentId: this.id.value,
      versionNumber: nextNumber,
      fileRef: params.fileRef,
      storageKey: params.storageKey,
      checksum: params.checksum,
      contentType: params.contentType,
      sizeBytes: params.sizeBytes,
      uploadedBy: params.uploadedBy,
    });
    this._versions.push(version);
    this._currentVersionNumber = nextNumber;
    this.raise(
      new DocumentVersionAdded(this.id.value, this.tenantId.value, nextNumber, version.fileRef, version.checksum),
    );
    this.incrementVersion();
    return version;
  }

  archive(): void {
    if (this._status === 'archived') throw new Error('Document already archived');
    this._status = 'archived';
    this.incrementVersion();
  }

  getVersion(versionNumber: number): DocumentVersion {
    const version = this._versions.find((v) => v.versionNumber === versionNumber);
    if (!version) throw new Error(`Document version not found: ${versionNumber}`);
    return version;
  }

  static reconstruct(params: {
    id: DocumentId;
    tenantId: TenantId;
    fileName: string;
    category: DocumentCategory;
    entityRef: EntityReference;
    status: DocumentStatus;
    currentVersionNumber: number;
    versions: DocumentVersion[];
    uploadedBy: string;
    uploadedAt: string;
    version: number;
  }): Document {
    const document = new Document(
      params.id,
      params.tenantId,
      params.fileName,
      params.category,
      params.entityRef,
      params.status,
      params.currentVersionNumber,
      params.versions,
      params.uploadedBy,
      params.uploadedAt,
    );
    document._version = params.version;
    return document;
  }

  get fileName(): string {
    return this._fileName;
  }

  get category(): DocumentCategory {
    return this._category;
  }

  get entityRef(): EntityReference {
    return { ...this._entityRef };
  }

  get status(): DocumentStatus {
    return this._status;
  }

  get currentVersionNumber(): number {
    return this._currentVersionNumber;
  }

  get versions(): DocumentVersion[] {
    return [...this._versions];
  }

  get uploadedBy(): string {
    return this._uploadedBy;
  }

  get uploadedAt(): string {
    return this._uploadedAt;
  }
}