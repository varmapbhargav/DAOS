import { IssuanceId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ISSUANCE_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { IssuanceRepository } from '../../domain/repositories/issuance.repository';
import { IssuanceDto, toIssuanceDto } from '../issuance.mapper';

export class GetIssuanceQuery {
  constructor(public readonly issuanceId: string) {}
}

@QueryHandler(GetIssuanceQuery)
export class GetIssuanceHandler implements IQueryHandler<GetIssuanceQuery, IssuanceDto> {
  constructor(@Inject(ISSUANCE_REPOSITORY) private readonly issuances: IssuanceRepository) {}

  async execute(query: GetIssuanceQuery): Promise<IssuanceDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const issuance = await this.issuances.findById(tenantId, IssuanceId.create(query.issuanceId));
    if (!issuance) throw new NotFoundError(`Issuance not found: ${query.issuanceId}`);
    return toIssuanceDto(issuance);
  }
}