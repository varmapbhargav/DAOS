import { LegalEntityId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { LEGAL_ENTITY_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { LegalEntityRepository } from '../../domain/repositories/legal-entity.repository';
import { LegalEntityDto, toLegalEntityDto } from '../legal-entity.mapper';

export class GetLegalEntityQuery {
  constructor(public readonly entityId: string) {}
}

@QueryHandler(GetLegalEntityQuery)
export class GetLegalEntityHandler implements IQueryHandler<GetLegalEntityQuery, LegalEntityDto> {
  constructor(@Inject(LEGAL_ENTITY_REPOSITORY) private readonly entities: LegalEntityRepository) {}

  async execute(query: GetLegalEntityQuery): Promise<LegalEntityDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const entity = await this.entities.findById(tenantId, LegalEntityId.create(query.entityId));
    if (!entity) throw new NotFoundError(`Legal entity not found: ${query.entityId}`);
    return toLegalEntityDto(entity);
  }
}