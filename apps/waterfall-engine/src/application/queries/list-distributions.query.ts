import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DISTRIBUTION_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DistributionRepository } from '../../domain/repositories/distribution.repository';
import { DistributionDto, toDistributionDto } from '../waterfall.mapper';

export class ListDistributionsQuery {
  constructor(
    public readonly productId?: string,
    public readonly status?: string,
  ) {}
}

@QueryHandler(ListDistributionsQuery)
export class ListDistributionsHandler implements IQueryHandler<ListDistributionsQuery, DistributionDto[]> {
  constructor(@Inject(DISTRIBUTION_REPOSITORY) private readonly distributions: DistributionRepository) {}

  async execute(query: ListDistributionsQuery): Promise<DistributionDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    if (query.status) {
      const distributions = await this.distributions.findByStatus(tenantId, query.status);
      return distributions.map(toDistributionDto);
    }
    const distributions = await this.distributions.findAll(tenantId);
    return query.productId
      ? distributions.filter((d) => d.productId === query.productId).map(toDistributionDto)
      : distributions.map(toDistributionDto);
  }
}
