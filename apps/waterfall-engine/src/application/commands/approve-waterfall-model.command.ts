import { NotFoundError, OutboxPublisher, TenantContextHolder, TenantId, WaterfallModelId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OUTBOX_PUBLISHER, WATERFALL_MODEL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { WaterfallModelRepository } from '../../domain/repositories/waterfall-model.repository';

export class ApproveWaterfallModelCommand {
  constructor(public readonly modelId: string) {}
}

@CommandHandler(ApproveWaterfallModelCommand)
export class ApproveWaterfallModelHandler implements ICommandHandler<ApproveWaterfallModelCommand, { modelId: string }> {
  constructor(
    @Inject(WATERFALL_MODEL_REPOSITORY) private readonly models: WaterfallModelRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ApproveWaterfallModelCommand): Promise<{ modelId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const model = await this.models.findById(tenantId, WaterfallModelId.create(command.modelId));
    if (!model) throw new NotFoundError(`Waterfall model not found: ${command.modelId}`);
    model.approve();
    await this.models.save(model);
    await this.outbox.publish(model.pullEvents());
    return { modelId: model.id.value };
  }
}
