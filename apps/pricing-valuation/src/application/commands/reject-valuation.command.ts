import { NotFoundError, OutboxPublisher, TenantContextHolder, TenantId, ValuationModelId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OUTBOX_PUBLISHER, VALUATION_MODEL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ValuationModelRepository } from '../../domain/repositories/valuation-model.repository';
import { RejectValuationDto } from '../dto/pricing.dto';

export class RejectValuationCommand {
  constructor(
    public readonly valuationModelId: string,
    public readonly dto: RejectValuationDto,
  ) {}
}

@CommandHandler(RejectValuationCommand)
export class RejectValuationHandler implements ICommandHandler<RejectValuationCommand, { valuationModelId: string }> {
  constructor(
    @Inject(VALUATION_MODEL_REPOSITORY) private readonly models: ValuationModelRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RejectValuationCommand): Promise<{ valuationModelId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const model = await this.models.findById(tenantId, ValuationModelId.create(command.valuationModelId));
    if (!model) throw new NotFoundError(`Valuation model not found: ${command.valuationModelId}`);
    model.reject(command.dto.reason);
    await this.models.save(model);
    await this.outbox.publish(model.pullEvents());
    return { valuationModelId: model.id.value };
  }
}
