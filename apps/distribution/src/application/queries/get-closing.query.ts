import { ClosingId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CLOSING_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ClosingRepository } from '../../domain/repositories/closing.repository';
import { ClosingDto, toClosingDto } from '../distribution.mapper';

export class GetClosingQuery {
  constructor(public readonly closingId: string) {}
}

@QueryHandler(GetClosingQuery)
export class GetClosingHandler implements IQueryHandler<GetClosingQuery, ClosingDto> {
  constructor(@Inject(CLOSING_REPOSITORY) private readonly closings: ClosingRepository) {}

  async execute(query: GetClosingQuery): Promise<ClosingDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const closing = await this.closings.findById(tenantId, ClosingId.create(query.closingId));
    if (!closing) throw new NotFoundError(`Closing not found: ${query.closingId}`);
    return toClosingDto(closing);
  }
}