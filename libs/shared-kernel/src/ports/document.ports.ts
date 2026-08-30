// Document Management infrastructure ports.
// External-provider ports used by the document-management bounded context.
import { DocumentCategory } from '../index';

export interface DocumentStoragePort {
  upload(params: {
    fileRef: string;
    bytes: Buffer;
    contentType: string;
    category: DocumentCategory;
  }): Promise<{ storageKey: string; checksum: string; sizeBytes: number }>;
  getDownloadUrl(storageKey: string, expiresInSeconds?: number): Promise<string>;
  delete(storageKey: string): Promise<void>;
}
