import {
  CorporateActionId,
  CorporateActionStatus,
  CorporateActionType,
  DistributionId,
  DistributionStatus,
  DistributionType,
  Money,
  TenantId,
  WaterfallModelId,
  WaterfallTier,
  WaterfallType,
} from '@daos/shared-kernel';

import { CorporateAction } from '../../../domain/aggregates/corporate-action.aggregate';
import { Distribution } from '../../../domain/aggregates/distribution.aggregate';
import { WaterfallModel, WaterfallModelStatus } from '../../../domain/aggregates/waterfall-model.aggregate';
import {
  CorporateActionOrmEntity,
  DistributionOrmEntity,
  WaterfallModelOrmEntity,
} from '../entities/waterfall.orm-entities';

type MoneyRow = { amount: string; currency: string };
type InvestorDistributionRow = {
  investorId: string;
  shareCount: number;
  grossAmount: MoneyRow;
  withholdingTax: MoneyRow;
  netAmount: MoneyRow;
};

function moneyToRow(money: Money): MoneyRow {
  return { amount: money.amount.toString(), currency: money.currency };
}

function moneyFromRow(row: MoneyRow): Money {
  return Money.of(BigInt(row.amount), row.currency);
}

export function waterfallModelToOrm(m: WaterfallModel): Partial<WaterfallModelOrmEntity> {
  return {
    id: m.id.value,
    tenantId: m.tenantId.value,
    name: m.name,
    waterfallType: m.waterfallType,
    productId: m.productId,
    status: m.status,
    tiers: m.tiers as unknown as object,
    version: m.version,
  };
}

export function waterfallModelFromOrm(e: WaterfallModelOrmEntity): WaterfallModel {
  return WaterfallModel.reconstruct({
    id: WaterfallModelId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    name: e.name,
    waterfallType: e.waterfallType as WaterfallType,
    productId: e.productId,
    tiers: (e.tiers as unknown as WaterfallTier[]) ?? [],
    status: e.status as WaterfallModelStatus,
    version: e.version,
  });
}

export function distributionToOrm(d: Distribution): Partial<DistributionOrmEntity> {
  return {
    id: d.id.value,
    tenantId: d.tenantId.value,
    productId: d.productId,
    distributionType: d.distributionType,
    currency: d.currency,
    totalAmount: d.totalAmount.toString(),
    recordDate: d.recordDate,
    paymentDate: d.paymentDate,
    status: d.status,
    investorDistributions: d.investorDistributions.map((i) => ({
      investorId: i.investorId,
      shareCount: i.shareCount,
      grossAmount: moneyToRow(i.grossAmount),
      withholdingTax: moneyToRow(i.withholdingTax),
      netAmount: moneyToRow(i.netAmount),
    })) as unknown as object,
    promote: d.promote.toString(),
    carriedInterest: d.carriedInterest.toString(),
    version: d.version,
  };
}

export function distributionFromOrm(e: DistributionOrmEntity): Distribution {
  const rows = (e.investorDistributions as unknown as InvestorDistributionRow[]) ?? [];
  return Distribution.reconstruct({
    id: DistributionId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    productId: e.productId,
    distributionType: e.distributionType as DistributionType,
    currency: e.currency,
    totalAmount: BigInt(e.totalAmount),
    recordDate: e.recordDate,
    paymentDate: e.paymentDate,
    status: e.status as DistributionStatus,
    investorDistributions: rows.map((r) => ({
      investorId: r.investorId,
      shareCount: r.shareCount,
      grossAmount: moneyFromRow(r.grossAmount),
      withholdingTax: moneyFromRow(r.withholdingTax),
      netAmount: moneyFromRow(r.netAmount),
    })),
    promote: BigInt(e.promote),
    carriedInterest: BigInt(e.carriedInterest),
    version: e.version,
  });
}

export function corporateActionToOrm(a: CorporateAction): Partial<CorporateActionOrmEntity> {
  return {
    id: a.id.value,
    tenantId: a.tenantId.value,
    issuanceId: a.issuanceId,
    type: a.type,
    exDate: a.exDate,
    recordDate: a.recordDate,
    paymentDate: a.paymentDate,
    status: a.status,
    options: a.options as unknown as object,
    elections: a.elections as unknown as object,
    version: a.version,
  };
}

export function corporateActionFromOrm(e: CorporateActionOrmEntity): CorporateAction {
  return CorporateAction.reconstruct({
    id: CorporateActionId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    issuanceId: e.issuanceId,
    type: e.type as CorporateActionType,
    exDate: e.exDate,
    recordDate: e.recordDate,
    paymentDate: e.paymentDate,
    status: e.status as CorporateActionStatus,
    options: (e.options as unknown as string[]) ?? [],
    elections: (e.elections as unknown as { investorId: string; electionType: string; electionDate: string }[]) ?? [],
    version: e.version,
  });
}
