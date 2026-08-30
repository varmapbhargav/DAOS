import { CapTableId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CAP_TABLE_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { CapTableRepository } from '../../domain/repositories/cap-table.repository';
import { CapTableDto, toCapTableDto } from '../cap-table.mapper';

export class GetCapTableQuery {
  constructor(public readonly capTableId: string) {}
}

@QueryHandler(GetCapTableQuery)
export class GetCapTableHandler implements IQueryHandler<GetCapTableQuery, CapTableDto> {
  constructor(@Inject(CAP_TABLE_REPOSITORY) private readonly capTables: CapTableRepository) {}

  async execute(query: GetCapTableQuery): Promise<CapTableDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const capTable = await this.capTables.findById(tenantId, CapTableId.create(query.capTableId));
    if (!capTable) throw new NotFoundError(`Cap table not found: ${query.capTableId}`);
    return toCapTableDto(capTable);
  }
}