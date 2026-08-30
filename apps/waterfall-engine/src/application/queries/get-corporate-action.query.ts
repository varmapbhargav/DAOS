import { CorporateActionId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CORPORATE_ACTION_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { CorporateActionRepository } from '../../domain/repositories/corporate-action.repository';
import { CorporateActionDto, toCorporateActionDto } from '../waterfall.mapper';

export class GetCorporateActionQuery {
  constructor(public readonly corporateActionId: string) {}
}

@QueryHandler(GetCorporateActionQuery)
export class GetCorporateActionHandler implements IQueryHandler<GetCorporateActionQuery, CorporateActionDto> {
  constructor(@Inject(CORPORATE_ACTION_REPOSITORY) private readonly actions: CorporateActionRepository) {}

  async execute(query: GetCorporateActionQuery): Promise<CorporateActionDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const action = await this.actions.findById(tenantId, CorporateActionId.create(query.corporateActionId));
    if (!action) throw new NotFoundError(`Corporate action not found: ${query.corporateActionId}`);
    return toCorporateActionDto(action);
  }
}
