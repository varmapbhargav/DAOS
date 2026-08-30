import { NotFoundError, TenantContextHolder, TenantId, WaterfallModelId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { WATERFALL_MODEL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { WaterfallModelRepository } from '../../domain/repositories/waterfall-model.repository';
import { toWaterfallModelDto, WaterfallModelDto } from '../waterfall.mapper';

export class GetWaterfallModelQuery {
  constructor(public readonly modelId: string) {}
}

@QueryHandler(GetWaterfallModelQuery)
export class GetWaterfallModelHandler implements IQueryHandler<GetWaterfallModelQuery, WaterfallModelDto> {
  constructor(@Inject(WATERFALL_MODEL_REPOSITORY) private readonly models: WaterfallModelRepository) {}

  async execute(query: GetWaterfallModelQuery): Promise<WaterfallModelDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const model = await this.models.findById(tenantId, WaterfallModelId.create(query.modelId));
    if (!model) throw new NotFoundError(`Waterfall model not found: ${query.modelId}`);
    return toWaterfallModelDto(model);
  }
}
