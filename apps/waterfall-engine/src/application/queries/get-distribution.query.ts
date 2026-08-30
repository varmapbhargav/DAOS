import { DistributionId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DISTRIBUTION_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DistributionRepository } from '../../domain/repositories/distribution.repository';
import { DistributionDto, toDistributionDto } from '../waterfall.mapper';

export class GetDistributionQuery {
  constructor(public readonly distributionId: string) {}
}

@QueryHandler(GetDistributionQuery)
export class GetDistributionHandler implements IQueryHandler<GetDistributionQuery, DistributionDto> {
  constructor(@Inject(DISTRIBUTION_REPOSITORY) private readonly distributions: DistributionRepository) {}

  async execute(query: GetDistributionQuery): Promise<DistributionDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const distribution = await this.distributions.findById(tenantId, DistributionId.create(query.distributionId));
    if (!distribution) throw new NotFoundError(`Distribution not found: ${query.distributionId}`);
    return toDistributionDto(distribution);
  }
}
