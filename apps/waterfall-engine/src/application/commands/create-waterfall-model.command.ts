import { OutboxPublisher, TenantContextHolder, TenantId, WaterfallTier } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { WaterfallModel } from '../../domain/aggregates/waterfall-model.aggregate';
import { OUTBOX_PUBLISHER, WATERFALL_MODEL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { WaterfallModelRepository } from '../../domain/repositories/waterfall-model.repository';
import { CreateWaterfallModelDto } from '../dto/waterfall.dto';

export class CreateWaterfallModelCommand {
  constructor(public readonly dto: CreateWaterfallModelDto) {}
}

@CommandHandler(CreateWaterfallModelCommand)
export class CreateWaterfallModelHandler implements ICommandHandler<CreateWaterfallModelCommand, { modelId: string }> {
  constructor(
    @Inject(WATERFALL_MODEL_REPOSITORY) private readonly models: WaterfallModelRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CreateWaterfallModelCommand): Promise<{ modelId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const model = WaterfallModel.create({
      tenantId,
      name: command.dto.name,
      waterfallType: command.dto.waterfallType as WaterfallModel['waterfallType'],
      productId: command.dto.productId,
      tiers: command.dto.tiers as WaterfallTier[],
    });
    await this.models.save(model);
    await this.outbox.publish(model.pullEvents());
    return { modelId: model.id.value };
  }
}
