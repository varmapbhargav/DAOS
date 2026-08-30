import { DocumentId, TenantId } from '@daos/shared-kernel';

import { Document } from '../../src/domain/aggregates/document.aggregate';
import { DocumentVersion } from '../../src/domain/entities/document-version.entity';

const tenantId = TenantId.create('tenant-docs');

function versionParams(overrides: Partial<Record<string, unknown>> = {}) {
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

function uploaded(): { document: Document; firstVersion: DocumentVersion } {
  const document = Document.upload({
    tenantId,
    fileName: 'Private Placement Memorandum.pdf',
    category: 'offeringMemorandum',
    entityRef: { entityType: 'issuance', entityId: 'issuance-1' },
    version: versionParams(),
  });
  const firstVersion = document.getVersion(1);
  return { document, firstVersion };
}

describe('Document aggregate', () => {
  it('uploads a document with its first version', () => {
    const { document, firstVersion } = uploaded();
    expect(document.fileName).toBe('Private Placement Memorandum.pdf');
    expect(document.category).toBe('offeringMemorandum');
    expect(document.entityRef).toEqual({ entityType: 'issuance', entityId: 'issuance-1' });
    expect(document.status).toBe('uploaded');
    expect(document.currentVersionNumber).toBe(1);
    expect(document.versions).toHaveLength(1);
    expect(firstVersion.versionNumber).toBe(1);
    expect(document.version).toBe(1);

    const events = document.pullEvents();
    expect(events.map((e) => e.eventType)).toContain('document.uploaded.v1');
  });

  it('rejects an empty file name', () => {
    expect(() =>
      Document.upload({
        tenantId,
        fileName: '   ',
        category: 'other',
        entityRef: { entityType: 'issuance', entityId: 'i-1' },
        version: versionParams(),
      }),
    ).toThrow('Document file name is required');
  });

  it('adds versions sequentially and raises an event', () => {
    const { document } = uploaded();
    const version = document.addVersion({
      fileRef: 'documents/ref-2',
      storageKey: 's3://daos-documents/documents/ref-2',
      checksum: 'def456',
      contentType: 'application/pdf',
      sizeBytes: 2048,
      uploadedBy: 'user-1',
    });
    expect(version.versionNumber).toBe(2);
    expect(document.currentVersionNumber).toBe(2);
    expect(document.versions).toHaveLength(2);
    expect(document.pullEvents().map((e) => e.eventType)).toContain('document.version-added.v1');
  });

  it('finds a version by number', () => {
    const { document } = uploaded();
    document.addVersion({
      fileRef: 'documents/ref-2',
      storageKey: 's3://daos-documents/documents/ref-2',
      checksum: 'def456',
      contentType: 'application/pdf',
      sizeBytes: 2048,
      uploadedBy: 'user-1',
    });
    expect(document.getVersion(2).checksum).toBe('def456');
    expect(() => document.getVersion(99)).toThrow('Document version not found');
  });

  it('rejects new versions on archived documents', () => {
    const { document } = uploaded();
    document.archive();
    expect(document.status).toBe('archived');
    expect(() =>
      document.addVersion({
        fileRef: 'documents/ref-2',
        storageKey: 's3://daos-documents/documents/ref-2',
        checksum: 'def456',
        contentType: 'application/pdf',
        sizeBytes: 2048,
        uploadedBy: 'user-1',
      }),
    ).toThrow('Archived documents cannot receive new versions');
    expect(() => document.archive()).toThrow('Document already archived');
  });

  it('reconstructs preserving version', () => {
    const { document } = uploaded();
    document.addVersion({
      fileRef: 'documents/ref-2',
      storageKey: 's3://daos-documents/documents/ref-2',
      checksum: 'def456',
      contentType: 'application/pdf',
      sizeBytes: 2048,
      uploadedBy: 'user-1',
    });
    const clone = Document.reconstruct({
      id: DocumentId.create(document.id.value),
      tenantId: document.tenantId,
      fileName: document.fileName,
      category: document.category,
      entityRef: document.entityRef,
      status: document.status,
      currentVersionNumber: document.currentVersionNumber,
      versions: document.versions,
      uploadedBy: document.uploadedBy,
      uploadedAt: document.uploadedAt,
      version: document.version,
    });
    expect(clone.version).toBe(document.version);
    expect(clone.currentVersionNumber).toBe(2);
    expect(clone.pullEvents()).toHaveLength(0);
  });
});