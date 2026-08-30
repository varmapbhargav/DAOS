import { DocumentStoragePort } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';

const STORE = new Map<string, Buffer>();

/**
 * Stub S3-compatible document storage. Files are cached in-memory, keys are
 * returned as pseudo-S3 URLs and a checksum is computed on upload.
 */
@Injectable()
export class S3DocumentStorageAdapter implements DocumentStoragePort {
  async upload(params: {
    fileRef: string;
    bytes: Buffer;
    contentType: string;
    category: string;
  }): Promise<{ storageKey: string; checksum: string; sizeBytes: number }> {
    const storageKey = `s3://daos-documents/${params.fileRef}`;
    STORE.set(storageKey, params.bytes);
    const checksum = createHash('sha256').update(params.bytes).digest('hex');
    return { storageKey, checksum, sizeBytes: params.bytes.length };
  }

  async getDownloadUrl(storageKey: string, expiresInSeconds = 3600): Promise<string> {
    const nonce = randomUUID();
    return `${storageKey}?expires=${expiresInSeconds}&nonce=${nonce}`;
  }

  async delete(storageKey: string): Promise<void> {
    STORE.delete(storageKey);
  }
}