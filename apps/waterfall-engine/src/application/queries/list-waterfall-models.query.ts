import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { WATERFALL_MODEL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { WaterfallModelRepository } from '../../domain/repositories/waterfall-model.repository';
import { toWaterfallModelDto, WaterfallModelDto } from '../waterfall.mapper';

export class ListWaterfallModelsQuery {
  constructor(public readonly productId?: string) {}
}

@QueryHandler(ListWaterfallModelsQuery)
export class ListWaterfallModelsHandler implements IQueryHandler<ListWaterfallModelsQuery, WaterfallModelDto[]> {
  constructor(@Inject(WATERFALL_MODEL_REPOSITORY) private readonly models: WaterfallModelRepository) {}

  async execute(query: ListWaterfallModelsQuery): Promise<WaterfallModelDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    if (query.productId) {
      const models = await this.models.findByProductId(tenantId, query.productId);
      return models.map(toWaterfallModelDto);
    }
    const models = await this.models.findAll(tenantId);
    return models.map(toWaterfallModelDto);
  }
}
