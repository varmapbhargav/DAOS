import { EntityHierarchyNode, LegalEntityId, RegisteredAgent, TenantId } from '@daos/shared-kernel';

import { LegalEntity } from '../../src/domain/aggregates/legal-entity.aggregate';
import { CorporateDocument } from '../../src/domain/entities/corporate-document.aggregate';

const tenantId = TenantId.create('tenant-entity');

function formed(): LegalEntity {
  return LegalEntity.form({
    tenantId,
    legalName: 'Aurora Holdings LLC',
    entityType: 'delawareLLC',
    jurisdiction: 'Delaware',
    formationRef: 'formation-1',
  });
}

const agent: RegisteredAgent = {
  agencyName: 'Corp Services Inc',
  agentRef: 'agent-ref-1',
  jurisdiction: 'Delaware',
  goodStandingDate: '2026-01-15T00:00:00.000Z',
};

const node: EntityHierarchyNode = {
  parentEntityId: 'parent-1',
  childEntityIds: ['child-1', 'child-2'],
  relationType: 'subsidiary',
};

describe('LegalEntity aggregate', () => {
  it('forms in forming status with a formed event', () => {
    const entity = formed();
    expect(entity.status).toBe('forming');
    expect(entity.legalName).toBe('Aurora Holdings LLC');
    expect(entity.entityType).toBe('delawareLLC');
    expect(entity.jurisdiction).toBe('Delaware');
    expect(entity.formationRef).toBe('formation-1');
    expect(entity.registeredAgent).toBeNull();
    expect(entity.beneficialOwners).toEqual([]);
    expect(entity.documentIds).toEqual([]);
    expect(entity.version).toBe(1);
    const events = entity.pullEvents();
    expect(events.map((e) => e.eventType)).toContain('entity.formed.v1');
  });

  it('requires a non-empty legal name', () => {
    expect(() =>
      LegalEntity.form({
        tenantId,
        legalName: '   ',
        entityType: 'delawareLLC',
        jurisdiction: 'Delaware',
        formationRef: null,
      }),
    ).toThrow('Legal entity name is required');
  });

  it('requires a jurisdiction', () => {
    expect(() =>
      LegalEntity.form({ tenantId, legalName: 'X', entityType: 'delawareLLC', jurisdiction: ' ', formationRef: null }),
    ).toThrow('Jurisdiction is required');
  });

  it('activates and raises an activated event, refusing double activation', () => {
    const entity = formed();
    entity.activate('user-1');
    expect(entity.status).toBe('active');
    expect(entity.pullEvents().map((e) => e.eventType)).toContain('entity.activated.v1');
    expect(() => entity.activate('user-2')).toThrow('already active');
  });

  it('refuses to activate a dissolved entity', () => {
    const entity = formed();
    entity.dissolve('wind-down');
    expect(() => entity.activate('user-1')).toThrow('Dissolved entities cannot be activated');
  });

  it('updates the hierarchy and raises an event', () => {
    const entity = formed();
    entity.updateHierarchy(node);
    expect(entity.hierarchy.relationType).toBe('subsidiary');
    expect(entity.hierarchy.childEntityIds).toEqual(['child-1', 'child-2']);
    expect(entity.pullEvents().map((e) => e.eventType)).toContain('entity.hierarchy.updated.v1');
  });

  it('appoints a registered agent and raises an event', () => {
    const entity = formed();
    entity.appointRegisteredAgent(agent);
    expect(entity.registeredAgent?.agencyName).toBe('Corp Services Inc');
    expect(entity.pullEvents().map((e) => e.eventType)).toContain('entity.registered-agent.appointed.v1');
  });

  it('dissolves and refuses double dissolution', () => {
    const entity = formed();
    entity.dissolve('regulatory wind-down');
    expect(entity.status).toBe('dissolved');
    expect(entity.dissolutionReason).toBe('regulatory wind-down');
    expect(entity.pullEvents().map((e) => e.eventType)).toContain('entity.dissolved.v1');
    expect(() => entity.dissolve('again')).toThrow('already dissolved');
  });

  it('attaches a corporate document id', () => {
    const entity = formed();
    const document = CorporateDocument.generate({
      tenantId,
      entityId: entity.id.value,
      docType: 'operatingAgreement',
      fileRef: 'gs://daos/legal/hr/oa-v1.pdf',
    });
    entity.attachDocument(document);
    expect(entity.documentIds).toContain(document.id.value);
  });

  it('reconstructs from persisted state preserving version', () => {
    const original = formed();
    original.activate('user-1');
    const clone = LegalEntity.reconstruct({
      id: LegalEntityId.create(original.id.value),
      tenantId: original.tenantId,
      legalName: original.legalName,
      entityType: original.entityType,
      jurisdiction: original.jurisdiction,
      status: original.status,
      registeredAgent: original.registeredAgent,
      beneficialOwners: original.beneficialOwners,
      hierarchy: original.hierarchy,
      documentIds: original.documentIds,
      formationRef: original.formationRef,
      dissolutionReason: original.dissolutionReason,
      version: original.version,
    });
    expect(clone.version).toBe(original.version);
    expect(clone.status).toBe('active');
    expect(clone.pullEvents()).toHaveLength(0);
  });
});
