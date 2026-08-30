import { CapitalCallId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CAPITAL_CALL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { CapitalCallRepository } from '../../domain/repositories/capital-call.repository';
import { CapitalCallDto, toCapitalCallDto } from '../distribution.mapper';

export class GetCapitalCallQuery {
  constructor(public readonly capitalCallId: string) {}
}

@QueryHandler(GetCapitalCallQuery)
export class GetCapitalCallHandler implements IQueryHandler<GetCapitalCallQuery, CapitalCallDto> {
  constructor(@Inject(CAPITAL_CALL_REPOSITORY) private readonly capitalCalls: CapitalCallRepository) {}

  async execute(query: GetCapitalCallQuery): Promise<CapitalCallDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const call = await this.capitalCalls.findById(tenantId, CapitalCallId.create(query.capitalCallId));
    if (!call) throw new NotFoundError(`Capital call not found: ${query.capitalCallId}`);
    return toCapitalCallDto(call);
  }
}