import { CapTableId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CAP_TABLE_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { CapTableRepository } from '../../domain/repositories/cap-table.repository';
import { ShareholderRecordDto, toShareholderRecordDto } from '../cap-table.mapper';

export class GetShareholderRecordQuery {
  constructor(
    public readonly capTableId: string,
    public readonly shareholderId: string,
    public readonly shareClassId?: string,
  ) {}
}

@QueryHandler(GetShareholderRecordQuery)
export class GetShareholderRecordHandler
  implements IQueryHandler<GetShareholderRecordQuery, ShareholderRecordDto>
{
  constructor(@Inject(CAP_TABLE_REPOSITORY) private readonly capTables: CapTableRepository) {}

  async execute(query: GetShareholderRecordQuery): Promise<ShareholderRecordDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const capTable = await this.capTables.findById(tenantId, CapTableId.create(query.capTableId));
    if (!capTable) throw new NotFoundError(`Cap table not found: ${query.capTableId}`);
    const record = capTable.getShareholder(query.shareholderId, query.shareClassId);
    return toShareholderRecordDto(record);
  }
}