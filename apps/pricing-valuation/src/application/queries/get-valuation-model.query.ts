import { NotFoundError, TenantContextHolder, TenantId, ValuationModelId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { VALUATION_MODEL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ValuationModelRepository } from '../../domain/repositories/valuation-model.repository';
import { toValuationModelDto, ValuationModelDto } from '../pricing.mapper';

export class GetValuationModelQuery {
  constructor(public readonly valuationModelId: string) {}
}

@QueryHandler(GetValuationModelQuery)
export class GetValuationModelHandler implements IQueryHandler<GetValuationModelQuery, ValuationModelDto> {
  constructor(@Inject(VALUATION_MODEL_REPOSITORY) private readonly models: ValuationModelRepository) {}

  async execute(query: GetValuationModelQuery): Promise<ValuationModelDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const model = await this.models.findById(tenantId, ValuationModelId.create(query.valuationModelId));
    if (!model) throw new NotFoundError(`Valuation model not found: ${query.valuationModelId}`);
    return toValuationModelDto(model);
  }
}
