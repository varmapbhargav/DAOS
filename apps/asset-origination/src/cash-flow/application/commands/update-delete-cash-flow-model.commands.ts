import { CashFlowModelId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CASH_FLOW_MODEL_REPOSITORY } from '../../../domain/repositories/repository.tokens';
import { CashFlowModelRepository } from '../../domain/repositories/cash-flow-model.repository';
import { SetDiscountRateDto, UpdateCashFlowModelDto } from '../dto/cash-flow-model.dto';

export class UpdateCashFlowModelCommand {
  constructor(
    public readonly modelId: string,
    public readonly dto: UpdateCashFlowModelDto,
  ) {}
}

@CommandHandler(UpdateCashFlowModelCommand)
export class UpdateCashFlowModelHandler
  implements ICommandHandler<UpdateCashFlowModelCommand, { modelId: string }>
{
  constructor(@Inject(CASH_FLOW_MODEL_REPOSITORY) private readonly repo: CashFlowModelRepository) {}

  async execute(command: UpdateCashFlowModelCommand): Promise<{ modelId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const model = await this.repo.findById(CashFlowModelId.create(command.modelId), tenantId);
    if (!model) throw new NotFoundError(`Cash flow model not found: ${command.modelId}`);
    model.update({
      name: command.dto.name,
      termPeriods: command.dto.termPeriods,
      discountRatePercent: command.dto.discountRatePercent,
    });
    await this.repo.save(model);
    return { modelId: model.id.value };
  }
}

export class SetDiscountRateCommand {
  constructor(
    public readonly modelId: string,
    public readonly dto: SetDiscountRateDto,
  ) {}
}

@CommandHandler(SetDiscountRateCommand)
export class SetDiscountRateHandler implements ICommandHandler<SetDiscountRateCommand, { modelId: string }> {
  constructor(@Inject(CASH_FLOW_MODEL_REPOSITORY) private readonly repo: CashFlowModelRepository) {}

  async execute(command: SetDiscountRateCommand): Promise<{ modelId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const model = await this.repo.findById(CashFlowModelId.create(command.modelId), tenantId);
    if (!model) throw new NotFoundError(`Cash flow model not found: ${command.modelId}`);
    model.setDiscountRate(command.dto.discountRatePercent);
    await this.repo.save(model);
    return { modelId: model.id.value };
  }
}

export class DeleteCashFlowModelCommand {
  constructor(public readonly modelId: string) {}
}

@CommandHandler(DeleteCashFlowModelCommand)
export class DeleteCashFlowModelHandler implements ICommandHandler<DeleteCashFlowModelCommand, { modelId: string }> {
  constructor(@Inject(CASH_FLOW_MODEL_REPOSITORY) private readonly repo: CashFlowModelRepository) {}

  async execute(command: DeleteCashFlowModelCommand): Promise<{ modelId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    await this.repo.delete(CashFlowModelId.create(command.modelId), tenantId);
    return { modelId: command.modelId };
  }
}
