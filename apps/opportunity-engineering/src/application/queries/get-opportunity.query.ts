import { OpportunityDto } from '@daos/opportunity-api';
import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { OpportunityId } from '@daos/shared-kernel';

import { OPPORTUNITY_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { OpportunityRepository } from '../../domain/repositories/opportunity.repository';
import { toOpportunityDto } from '../opportunity.mapper';

export class GetOpportunityQuery {
  constructor(public readonly opportunityId: string) {}
}

@QueryHandler(GetOpportunityQuery)
export class GetOpportunityHandler implements IQueryHandler<GetOpportunityQuery, OpportunityDto> {
  constructor(@Inject(OPPORTUNITY_REPOSITORY) private readonly opportunities: OpportunityRepository) {}

  async execute(query: GetOpportunityQuery): Promise<OpportunityDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const opportunity = await this.opportunities.findById(
      tenantId,
      OpportunityId.create(query.opportunityId),
    );
    if (!opportunity) {
      throw new NotFoundError(`Opportunity not found: ${query.opportunityId}`);
    }
    return toOpportunityDto(opportunity);
  }
}
