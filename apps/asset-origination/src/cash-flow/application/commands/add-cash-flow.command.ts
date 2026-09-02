import { CashFlowModelId, Money, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CASH_FLOW_MODEL_REPOSITORY } from '../../../domain/repositories/repository.tokens';
import { CashFlowModelRepository } from '../../domain/repositories/cash-flow-model.repository';
import { AddCashFlowDto } from '../dto/cash-flow-model.dto';

export class AddCashFlowCommand {
  constructor(
    public readonly modelId: string,
    public readonly dto: AddCashFlowDto,
  ) {}
}

@CommandHandler(AddCashFlowCommand)
export class AddCashFlowHandler implements ICommandHandler<AddCashFlowCommand, { modelId: string; period: number }> {
  constructor(@Inject(CASH_FLOW_MODEL_REPOSITORY) private readonly cashFlowModels: CashFlowModelRepository) {}

  async execute(command: AddCashFlowCommand): Promise<{ modelId: string; period: number }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const model = await this.cashFlowModels.findById(CashFlowModelId.create(command.modelId), tenantId);

    if (!model) {
      throw new NotFoundError(`Cash flow model not found: ${command.modelId}`);
    }

    model.addCashFlow({
      period: command.dto.period,
      amount: Money.of(BigInt(command.dto.amountMinorUnits), command.dto.currency),
    });

    await this.cashFlowModels.save(model);

    return {
      modelId: model.id.value,
      period: command.dto.period,
    };
  }
}
