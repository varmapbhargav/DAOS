import { Money, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CashFlowModel } from '../../domain/aggregates/cash-flow-model.aggregate';
import { CashFlowModelRepository } from '../../domain/repositories/cash-flow-model.repository';
import { AssetRepository } from '../../domain/repositories/asset.repository';
import { ASSET_REPOSITORY, CASH_FLOW_MODEL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { CreateCashFlowModelDto } from '../dto/cash-flow-model.dto';
import { AssetId } from '@daos/shared-kernel';

export class CreateCashFlowModelCommand {
  constructor(
    public readonly assetId: string,
    public readonly dto: CreateCashFlowModelDto,
  ) {}
}

@CommandHandler(CreateCashFlowModelCommand)
export class CreateCashFlowModelHandler
  implements ICommandHandler<CreateCashFlowModelCommand, { id: string; assetId: string }>
{
  constructor(
    @Inject(CASH_FLOW_MODEL_REPOSITORY) private readonly cashFlowModels: CashFlowModelRepository,
    @Inject(ASSET_REPOSITORY) private readonly assets: AssetRepository,
  ) {}

  async execute(command: CreateCashFlowModelCommand): Promise<{ id: string; assetId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    // Verify asset exists and belongs to tenant
    const asset = await this.assets.findById(tenantId, AssetId.create(command.assetId));
    if (!asset) {
      throw new NotFoundError(`Asset not found: ${command.assetId}`);
    }

    const cashFlows =
      command.dto.cashFlows?.map((cf) => ({
        period: cf.period,
        amount: Money.of(BigInt(cf.amountMinorUnits), cf.currency),
      })) ?? [];

    const model = CashFlowModel.create({
      tenantId,
      assetId: command.assetId,
      name: command.dto.name,
      termPeriods: command.dto.termPeriods,
      discountRatePercent: command.dto.discountRatePercent,
      cashFlows,
    });

    await this.cashFlowModels.save(model);

    return {
      id: model.id.value,
      assetId: model.assetId,
    };
  }
}
