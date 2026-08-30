import { LegalEntityId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { LEGAL_ENTITY_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { LegalEntityRepository } from '../../domain/repositories/legal-entity.repository';

export type EntityHierarchyDto = {
  entityId: string;
  parentEntityId: string | null;
  childEntityIds: string[];
  relationType: string;
};

export class GetEntityHierarchyQuery {
  constructor(public readonly entityId: string) {}
}

@QueryHandler(GetEntityHierarchyQuery)
export class GetEntityHierarchyHandler implements IQueryHandler<GetEntityHierarchyQuery, EntityHierarchyDto> {
  constructor(@Inject(LEGAL_ENTITY_REPOSITORY) private readonly entities: LegalEntityRepository) {}

  async execute(query: GetEntityHierarchyQuery): Promise<EntityHierarchyDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const entity = await this.entities.findById(tenantId, LegalEntityId.create(query.entityId));
    if (!entity) throw new NotFoundError(`Legal entity not found: ${query.entityId}`);
    return {
      entityId: entity.id.value,
      parentEntityId: entity.hierarchy.parentEntityId,
      childEntityIds: entity.hierarchy.childEntityIds,
      relationType: entity.hierarchy.relationType,
    };
  }
}