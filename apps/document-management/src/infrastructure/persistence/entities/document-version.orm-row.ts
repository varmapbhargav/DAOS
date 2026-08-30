export interface DocumentVersionOrmRow {
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