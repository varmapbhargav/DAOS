import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CAP_TABLE_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { CapTableRepository } from '../../domain/repositories/cap-table.repository';
import { CapTableDto, toCapTableDto } from '../cap-table.mapper';

export class ListCapTablesQuery {
  constructor(public readonly issuanceId?: string) {}
}

@QueryHandler(ListCapTablesQuery)
export class ListCapTablesHandler implements IQueryHandler<ListCapTablesQuery, CapTableDto[]> {
  constructor(@Inject(CAP_TABLE_REPOSITORY) private readonly capTables: CapTableRepository) {}

  async execute(query: ListCapTablesQuery): Promise<CapTableDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const capTables = await this.capTables.findAll(tenantId);
    return capTables
      .filter((ct) => (query.issuanceId ? ct.issuanceId === query.issuanceId : true))
      .map(toCapTableDto);
  }
}