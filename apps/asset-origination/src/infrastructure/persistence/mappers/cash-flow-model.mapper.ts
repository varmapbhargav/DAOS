import { CashFlowModelId, Money, TenantId } from '@daos/shared-kernel';

import { CashFlowModel, CashFlowRow } from '../../../domain/aggregates/cash-flow-model.aggregate';
import { CashFlowModelOrmEntity } from '../entities/cash-flow-model.orm-entity';

type CashFlowJson = {
  period: number;
  amountMinorUnits: string;
  currency: string;
};

export class CashFlowModelMapper {
  static toDomain(e: CashFlowModelOrmEntity): CashFlowModel {
    const cashFlows: CashFlowRow[] = (e.cashFlows as unknown as CashFlowJson[]).map((cf) => ({
      period: cf.period,
      amount: Money.of(BigInt(cf.amountMinorUnits), cf.currency),
    }));

    return CashFlowModel.reconstruct({
      id: CashFlowModelId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      assetId: e.assetId,
      name: e.name,
      termPeriods: e.termPeriods,
      cashFlows,
      discountRatePercent: e.discountRatePercent,
      version: e.version,
    });
  }

  static toOrm(domain: CashFlowModel): CashFlowModelOrmEntity {
    const e = new CashFlowModelOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.assetId = domain.assetId;
    e.name = domain.name;
    e.termPeriods = domain.termPeriods;
    e.cashFlows = domain.cashFlows.map((cf) => ({
      period: cf.period,
      amountMinorUnits: cf.amount.amount.toString(),
      currency: cf.amount.currency,
    }));
    e.discountRatePercent = domain.discountRatePercent;
    e.version = domain.version;
    return e;
  }
}
