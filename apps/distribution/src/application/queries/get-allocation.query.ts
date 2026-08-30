import { AllocationId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ALLOCATION_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { AllocationRepository } from '../../domain/repositories/allocation.repository';
import { AllocationDto, toAllocationDto } from '../distribution.mapper';

export class GetAllocationQuery {
  constructor(public readonly allocationId: string) {}
}

@QueryHandler(GetAllocationQuery)
export class GetAllocationHandler implements IQueryHandler<GetAllocationQuery, AllocationDto> {
  constructor(@Inject(ALLOCATION_REPOSITORY) private readonly allocations: AllocationRepository) {}

  async execute(query: GetAllocationQuery): Promise<AllocationDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const allocation = await this.allocations.findById(tenantId, AllocationId.create(query.allocationId));
    if (!allocation) throw new NotFoundError(`Allocation not found: ${query.allocationId}`);
    return toAllocationDto(allocation);
  }
}