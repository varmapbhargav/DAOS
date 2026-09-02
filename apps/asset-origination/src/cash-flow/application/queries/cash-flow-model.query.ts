import { CashFlowModelId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CASH_FLOW_MODEL_REPOSITORY } from '../../../domain/repositories/repository.tokens';
import { CashFlowModel, CashFlowRow } from '../../domain/aggregates/cash-flow-model.aggregate';
import { CashFlowModelRepository } from '../../domain/repositories/cash-flow-model.repository';

export interface CashFlowRowDto {
  period: number;
  amountMinorUnits: string;
  currency: string;
}

export interface CashFlowMetricsDto {
  npv: number;
  irr: number | null;
  totalCashFlows: number;
  totalInflow: number;
  totalOutflow: number;
}

export interface CashFlowModelDto {
  id: string;
  tenantId: string;
  assetId: string;
  name: string;
  termPeriods: number;
  discountRatePercent: number;
  cashFlows: CashFlowRowDto[];
  version: number;
  metrics: CashFlowMetricsDto;
}

function toCashFlowRowDto(cf: CashFlowRow): CashFlowRowDto {
  return {
    period: cf.period,
    amountMinorUnits: cf.amount.amount.toString(),
    currency: cf.amount.currency,
  };
}

function computeMetrics(model: CashFlowModel): CashFlowMetricsDto {
  let totalInflow = 0;
  let totalOutflow = 0;
  for (const cf of model.cashFlows) {
    const amount = Number(cf.amount.amount);
    if (amount >= 0) totalInflow += amount;
    else totalOutflow += amount;
  }
  return {
    npv: model.calculateNpv(),
    irr: model.calculateIrr(),
    totalCashFlows: model.cashFlows.length,
    totalInflow,
    totalOutflow,
  };
}

export function toCashFlowModelDto(model: CashFlowModel): CashFlowModelDto {
  return {
    id: model.id.value,
    tenantId: model.tenantId.value,
    assetId: model.assetId,
    name: model.name,
    termPeriods: model.termPeriods,
    discountRatePercent: model.discountRatePercent,
    cashFlows: model.cashFlows.map(toCashFlowRowDto),
    version: model.version,
    metrics: computeMetrics(model),
  };
}

export class GetCashFlowModelQuery {
  constructor(public readonly modelId: string) {}
}

@QueryHandler(GetCashFlowModelQuery)
export class GetCashFlowModelHandler implements IQueryHandler<GetCashFlowModelQuery, CashFlowModelDto> {
  constructor(@Inject(CASH_FLOW_MODEL_REPOSITORY) private readonly repo: CashFlowModelRepository) {}

  async execute(query: GetCashFlowModelQuery): Promise<CashFlowModelDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const model = await this.repo.findById(CashFlowModelId.create(query.modelId), tenantId);
    if (!model) throw new NotFoundError(`Cash flow model not found: ${query.modelId}`);
    return toCashFlowModelDto(model);
  }
}

export class ListCashFlowModelsByAssetQuery {
  constructor(public readonly assetId: string) {}
}

@QueryHandler(ListCashFlowModelsByAssetQuery)
export class ListCashFlowModelsByAssetHandler
  implements IQueryHandler<ListCashFlowModelsByAssetQuery, CashFlowModelDto[]>
{
  constructor(@Inject(CASH_FLOW_MODEL_REPOSITORY) private readonly repo: CashFlowModelRepository) {}

  async execute(query: ListCashFlowModelsByAssetQuery): Promise<CashFlowModelDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const models = await this.repo.findByAssetId(query.assetId, tenantId);
    return models.map(toCashFlowModelDto);
  }
}
