import {
  AggregateRoot,
  BeneficialOwnerRecord,
  EntityHierarchyNode,
  EntityStatus,
  EntityType,
  LegalEntityId,
  RegisteredAgent,
  TenantId,
} from '@daos/shared-kernel';

import { CorporateDocument } from '../entities/corporate-document.aggregate';
import { EntityActivated } from '../events/entity-activated.event';
import { EntityDissolved } from '../events/entity-dissolved.event';
import { EntityFormed } from '../events/entity-formed.event';
import { HierarchyUpdated } from '../events/hierarchy-updated.event';
import { RegisteredAgentAppointed } from '../events/registered-agent-appointed.event';

export class LegalEntity extends AggregateRoot {
  private constructor(
    public readonly id: LegalEntityId,
    public readonly tenantId: TenantId,
    private _legalName: string,
    private _entityType: EntityType,
    private _jurisdiction: string,
    private _status: EntityStatus,
    private _registeredAgent: RegisteredAgent | null,
    private _beneficialOwners: BeneficialOwnerRecord[],
    private _hierarchy: EntityHierarchyNode,
    private _documentIds: string[],
    private _formationRef: string | null,
    private _dissolutionReason: string | null,
  ) {
    super();
  }

  static form(params: {
    tenantId: TenantId;
    legalName: string;
    entityType: EntityType;
    jurisdiction: string;
    formationRef: string | null;
    beneficialOwners?: BeneficialOwnerRecord[];
  }): LegalEntity {
    if (!params.legalName.trim()) throw new Error('Legal entity name is required');
    if (!params.jurisdiction.trim()) throw new Error('Jurisdiction is required');
    const entity = new LegalEntity(
      LegalEntityId.create(),
      params.tenantId,
      params.legalName.trim(),
      params.entityType,
      params.jurisdiction.trim(),
      'forming',
      null,
      params.beneficialOwners ?? [],
      { parentEntityId: null, childEntityIds: [], relationType: 'root' },
      [],
      params.formationRef ?? null,
      null,
    );
    entity.raise(
      new EntityFormed(
        entity.id.value,
        entity.tenantId.value,
        entity._legalName,
        entity._entityType,
        entity._jurisdiction,
        entity._formationRef,
      ),
    );
    entity.incrementVersion();
    return entity;
  }

  static reconstruct(params: {
    id: LegalEntityId;
    tenantId: TenantId;
    legalName: string;
    entityType: EntityType;
    jurisdiction: string;
    status: EntityStatus;
    registeredAgent: RegisteredAgent | null;
    beneficialOwners: BeneficialOwnerRecord[];
    hierarchy: EntityHierarchyNode;
    documentIds: string[];
    formationRef: string | null;
    dissolutionReason: string | null;
    version: number;
  }): LegalEntity {
    const entity = new LegalEntity(
      params.id,
      params.tenantId,
      params.legalName,
      params.entityType,
      params.jurisdiction,
      params.status,
      params.registeredAgent,
      params.beneficialOwners,
      params.hierarchy,
      params.documentIds,
      params.formationRef,
      params.dissolutionReason,
    );
    entity._version = params.version;
    return entity;
  }

  get legalName(): string {
    return this._legalName;
  }

  get entityType(): EntityType {
    return this._entityType;
  }

  get jurisdiction(): string {
    return this._jurisdiction;
  }

  get status(): EntityStatus {
    return this._status;
  }

  get registeredAgent(): RegisteredAgent | null {
    return this._registeredAgent;
  }

  get beneficialOwners(): BeneficialOwnerRecord[] {
    return [...this._beneficialOwners];
  }

  get hierarchy(): EntityHierarchyNode {
    return { ...this._hierarchy, childEntityIds: [...this._hierarchy.childEntityIds] };
  }

  get documentIds(): string[] {
    return [...this._documentIds];
  }

  get formationRef(): string | null {
    return this._formationRef;
  }

  get dissolutionReason(): string | null {
    return this._dissolutionReason;
  }

  activate(by: string): void {
    if (this._status === 'dissolved') throw new Error('Dissolved entities cannot be activated');
    if (this._status === 'suspended') throw new Error('Suspended entities cannot be activated');
    if (this._status === 'active') throw new Error('Entity is already active');
    this._status = 'active';
    this.raise(new EntityActivated(this.id.value, this.tenantId.value, by));
    this.incrementVersion();
  }

  updateHierarchy(node: EntityHierarchyNode): void {
    this._hierarchy = node;
    this.raise(new HierarchyUpdated(this.id.value, this.tenantId.value, node.parentEntityId, node.relationType));
    this.incrementVersion();
  }

  appointRegisteredAgent(agent: RegisteredAgent): void {
    this._registeredAgent = agent;
    this.raise(new RegisteredAgentAppointed(this.id.value, this.tenantId.value, agent.agencyName));
    this.incrementVersion();
  }

  dissolve(reason: string): void {
    if (this._status === 'dissolved') throw new Error('Entity is already dissolved');
    this._status = 'dissolved';
    this._dissolutionReason = reason;
    this.raise(new EntityDissolved(this.id.value, this.tenantId.value, reason));
    this.incrementVersion();
  }

  attachDocument(document: CorporateDocument): void {
    this._documentIds.push(document.id.value);
    this.incrementVersion();
  }
}