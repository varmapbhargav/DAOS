import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ISSUANCE_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { IssuanceRepository } from '../../domain/repositories/issuance.repository';
import { IssuanceDto, toIssuanceDto } from '../issuance.mapper';

export class ListIssuancesQuery {}

@QueryHandler(ListIssuancesQuery)
export class ListIssuancesHandler implements IQueryHandler<ListIssuancesQuery, IssuanceDto[]> {
  constructor(@Inject(ISSUANCE_REPOSITORY) private readonly issuances: IssuanceRepository) {}

  async execute(): Promise<IssuanceDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const list = await this.issuances.findAll(tenantId);
    return list.map(toIssuanceDto);
  }
}