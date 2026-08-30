import { TenantId } from '@daos/shared-kernel';

import { CorporateDocument as DocumentAggregate } from '../../src/domain/entities/corporate-document.aggregate';

const tenantId = TenantId.create('tenant-entity');

function generated(): DocumentAggregate {
  return DocumentAggregate.generate({
    tenantId,
    entityId: 'entity-1',
    docType: 'operatingAgreement',
    fileRef: 'gs://daos/legal/hr/operating-agreement-v1.pdf',
  });
}

describe('CorporateDocument aggregate', () => {
  it('generates in pending status with a generated event', () => {
    const doc = generated();
    expect(doc.status).toBe('pending');
    expect(doc.docType).toBe('operatingAgreement');
    expect(doc.fileRef).toBe('gs://daos/legal/hr/operating-agreement-v1.pdf');
    expect(doc.entityId).toBe('entity-1');
    expect(doc.signatories).toEqual([]);
    expect(doc.version).toBe(1);
    const events = doc.pullEvents();
    expect(events.map((e) => e.eventType)).toContain('entity.document.generated.v1');
  });

  it('requires a non-empty file ref', () => {
    expect(() =>
      DocumentAggregate.generate({ tenantId, entityId: 'entity-1', docType: 'ppm', fileRef: '   ' }),
    ).toThrow('Document file reference is required');
  });

  it('tracks signatory status transitions to fully executed', () => {
    const doc = generated();
    doc.addSignatory({ userId: 'user-1', role: 'member', signedAt: new Date().toISOString() });
    expect(doc.status).toBe('fullyExecuted');
    doc.addSignatory({ userId: 'user-2', role: 'member', signedAt: null });
    expect(doc.status).toBe('partiallyExecuted');
    doc.markExecuted();
    expect(doc.status).toBe('fullyExecuted');
    expect(doc.signatories.every((s) => s.signedAt !== null)).toBe(true);
  });

  it('marks executed and refuses double execution', () => {
    const doc = generated();
    doc.addSignatory({ userId: 'user-1', role: 'manager', signedAt: null });
    doc.markExecuted();
    expect(doc.status).toBe('fullyExecuted');
    expect(doc.signatories[0].signedAt).not.toBeNull();
    expect(() => doc.markExecuted()).toThrow('already fully executed');
  });
});
