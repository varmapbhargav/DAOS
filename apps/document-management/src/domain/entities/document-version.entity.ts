import { AggregateRoot, DocumentVersionId } from '@daos/shared-kernel';

export type CreateDocumentVersionProps = {
  documentId: string;
  versionNumber: number;
  fileRef: string;
  storageKey: string;
  checksum: string;
  contentType: string;
  sizeBytes: number;
  uploadedBy: string;
};

export class DocumentVersion extends AggregateRoot {
  private constructor(
    public readonly id: DocumentVersionId,
    public readonly documentId: string,
    public readonly versionNumber: number,
    public readonly fileRef: string,
    public readonly storageKey: string,
    public readonly checksum: string,
    public readonly contentType: string,
    public readonly sizeBytes: number,
    public readonly uploadedBy: string,
    public readonly uploadedAt: string,
  ) {
    super();
  }

  static create(props: CreateDocumentVersionProps): DocumentVersion {
    if (!props.fileRef.trim()) throw new Error('Document version file reference is required');
    if (props.versionNumber < 1) throw new Error('Document version number must be positive');
    if (!props.uploadedBy.trim()) throw new Error('Document uploader is required');
    const version = new DocumentVersion(
      DocumentVersionId.create(),
      props.documentId,
      props.versionNumber,
      props.fileRef.trim(),
      props.storageKey,
      props.checksum,
      props.contentType,
      props.sizeBytes,
      props.uploadedBy,
      new Date().toISOString(),
    );
    version.incrementVersion();
    return version;
  }

  static reconstruct(props: {
    id: DocumentVersionId;
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
  }): DocumentVersion {
    const version = new DocumentVersion(
      props.id,
      props.documentId,
      props.versionNumber,
      props.fileRef,
      props.storageKey,
      props.checksum,
      props.contentType,
      props.sizeBytes,
      props.uploadedBy,
      props.uploadedAt,
    );
    version._version = props.version;
    return version;
  }
}