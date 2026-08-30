import { OpportunityDto } from '@daos/opportunity-api';
import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { OPPORTUNITY_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { OpportunityRepository } from '../../domain/repositories/opportunity.repository';
import { toOpportunityDto } from '../opportunity.mapper';

export class ListOpportunitiesQuery {
  constructor(public readonly assetId?: string) {}
}

@QueryHandler(ListOpportunitiesQuery)
export class ListOpportunitiesHandler implements IQueryHandler<ListOpportunitiesQuery, OpportunityDto[]> {
  constructor(@Inject(OPPORTUNITY_REPOSITORY) private readonly opportunities: OpportunityRepository) {}

  async execute(query: ListOpportunitiesQuery): Promise<OpportunityDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const list = await this.opportunities.findAll(tenantId);
    const filtered = query.assetId ? list.filter((o) => o.assetId === query.assetId) : list;
    return filtered.map(toOpportunityDto);
  }
}
