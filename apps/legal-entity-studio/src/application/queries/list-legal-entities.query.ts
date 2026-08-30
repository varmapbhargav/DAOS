import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { LEGAL_ENTITY_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { LegalEntityRepository } from '../../domain/repositories/legal-entity.repository';
import { LegalEntityDto, toLegalEntityDto } from '../legal-entity.mapper';

export class ListLegalEntitiesQuery {}

@QueryHandler(ListLegalEntitiesQuery)
export class ListLegalEntitiesHandler implements IQueryHandler<ListLegalEntitiesQuery, LegalEntityDto[]> {
  constructor(@Inject(LEGAL_ENTITY_REPOSITORY) private readonly entities: LegalEntityRepository) {}

  async execute(): Promise<LegalEntityDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const list = await this.entities.findAll(tenantId);
    return list.map(toLegalEntityDto);
  }
}