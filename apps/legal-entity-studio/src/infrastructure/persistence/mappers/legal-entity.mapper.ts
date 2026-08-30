import { BeneficialOwnerRecord, EntityHierarchyNode, EntityStatus, EntityType, LegalEntityId, RegisteredAgent, TenantId } from '@daos/shared-kernel';

import { LegalEntity } from '../../../domain/aggregates/legal-entity.aggregate';
import { LegalEntityOrmEntity } from '../entities/legal-entity.orm-entity';

export class LegalEntityMapper {
  static toOrm(entity: LegalEntity): Partial<LegalEntityOrmEntity> {
    return {
      id: entity.id.value,
      tenantId: entity.tenantId.value,
      legalName: entity.legalName,
      entityType: entity.entityType,
      jurisdiction: entity.jurisdiction,
      status: entity.status,
      registeredAgent: (entity.registeredAgent as RegisteredAgent | null) as object | null,
      beneficialOwners: entity.beneficialOwners as BeneficialOwnerRecord[] as object,
      hierarchy: entity.hierarchy as EntityHierarchyNode as object,
      documentIds: entity.documentIds,
      formationRef: entity.formationRef,
      dissolutionReason: entity.dissolutionReason,
      version: entity.version,
    };
  }

  static toDomain(e: LegalEntityOrmEntity): LegalEntity {
    return LegalEntity.reconstruct({
      id: LegalEntityId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      legalName: e.legalName,
      entityType: e.entityType as EntityType,
      jurisdiction: e.jurisdiction,
      status: (e.status as EntityStatus) ?? 'forming',
      registeredAgent: e.registeredAgent as RegisteredAgent | null,
      beneficialOwners: (e.beneficialOwners as BeneficialOwnerRecord[]) ?? [],
      hierarchy: (e.hierarchy as EntityHierarchyNode) ?? { parentEntityId: null, childEntityIds: [], relationType: 'root' },
      documentIds: e.documentIds ?? [],
      formationRef: e.formationRef,
      dissolutionReason: e.dissolutionReason,
      version: e.version,
    });
  }
}
