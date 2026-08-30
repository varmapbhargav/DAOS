import { DocumentVersionId } from '@daos/shared-kernel';

import { DocumentVersion } from '../../src/domain/entities/document-version.entity';

function props(overrides: Partial<{ fileRef: string; versionNumber: number; uploadedBy: string }> = {}) {
  return {
    documentId: 'doc-1',
    versionNumber: 1,
    fileRef: 'documents/ref-1',
    storageKey: 's3://daos-documents/documents/ref-1',
    checksum: 'abc123',
    contentType: 'application/pdf',
    sizeBytes: 1024,
    uploadedBy: 'user-1',
    ...overrides,
  };
}

describe('DocumentVersion entity', () => {
  it('creates a version with metadata', () => {
    const version = DocumentVersion.create(props());
    expect(version.versionNumber).toBe(1);
    expect(version.fileRef).toBe('documents/ref-1');
    expect(version.checksum).toBe('abc123');
    expect(version.sizeBytes).toBe(1024);
    expect(version.uploadedBy).toBe('user-1');
    expect(version.uploadedAt).toBeDefined();
    expect(version.version).toBe(1);
  });

  it('rejects empty file reference', () => {
    expect(() => DocumentVersion.create(props({ fileRef: '   ' }))).toThrow('Document version file reference is required');
  });

  it('rejects non-positive version numbers', () => {
    expect(() => DocumentVersion.create(props({ versionNumber: 0 }))).toThrow('Document version number must be positive');
  });

  it('rejects missing uploader', () => {
    expect(() => DocumentVersion.create(props({ uploadedBy: '  ' }))).toThrow('Document uploader is required');
  });

  it('reconstructs preserving id and version', () => {
    const original = DocumentVersion.create(props());
    const clone = DocumentVersion.reconstruct({
      id: DocumentVersionId.create(original.id.value),
      documentId: original.documentId,
      versionNumber: original.versionNumber,
      fileRef: original.fileRef,
      storageKey: original.storageKey,
      checksum: original.checksum,
      contentType: original.contentType,
      sizeBytes: original.sizeBytes,
      uploadedBy: original.uploadedBy,
      uploadedAt: original.uploadedAt,
      version: original.version,
    });
    expect(clone.id.value).toBe(original.id.value);
    expect(clone.version).toBe(original.version);
  });
});