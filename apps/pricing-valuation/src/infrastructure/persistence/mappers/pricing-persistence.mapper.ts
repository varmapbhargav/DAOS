import {
  FairValueHierarchy,
  Money,
  PriceId,
  PricingSource,
  TenantId,
  ValuationModelId,
  ValuationModelType,
} from '@daos/shared-kernel';

import { Price } from '../../../domain/aggregates/price.aggregate';
import { ValuationModel, ValuationModelStatus } from '../../../domain/aggregates/valuation-model.aggregate';
import { PriceOrmEntity, ValuationModelOrmEntity } from '../entities/pricing.orm-entities';

type MoneyRow = { amount: string; currency: string };

function moneyToRow(money: Money): MoneyRow {
  return { amount: money.amount.toString(), currency: money.currency };
}

function moneyFromRow(row: MoneyRow): Money {
  return Money.of(BigInt(row.amount), row.currency);
}

export function priceToOrm(p: Price): Partial<PriceOrmEntity> {
  return {
    id: p.id.value,
    tenantId: p.tenantId.value,
    isin: p.isin,
    price: moneyToRow(p.price) as unknown as object,
    source: p.source,
    fairValueHierarchy: p.fairValueHierarchy,
    lastUpdatedAt: p.lastUpdatedAt,
    isStale: p.isStale,
    version: p.version,
  };
}

export function priceFromOrm(e: PriceOrmEntity): Price {
  return Price.reconstruct({
    id: PriceId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    isin: e.isin,
    price: moneyFromRow(e.price as MoneyRow),
    source: e.source as PricingSource,
    fairValueHierarchy: e.fairValueHierarchy as FairValueHierarchy,
    lastUpdatedAt: e.lastUpdatedAt,
    isStale: e.isStale,
    version: e.version,
  });
}

export function valuationModelToOrm(m: ValuationModel): Partial<ValuationModelOrmEntity> {
  return {
    id: m.id.value,
    tenantId: m.tenantId.value,
    assetId: m.assetId,
    methodology: m.methodology,
    status: m.status,
    value: m.value ? (moneyToRow(m.value) as unknown as object) : null,
    reportId: m.reportId,
    rejectionReason: m.rejectionReason,
    discrepancyDetected: m.discrepancyDetected,
    version: m.version,
  };
}

export function valuationModelFromOrm(e: ValuationModelOrmEntity): ValuationModel {
  return ValuationModel.reconstruct({
    id: ValuationModelId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    assetId: e.assetId,
    methodology: e.methodology as ValuationModelType,
    status: e.status as ValuationModelStatus,
    value: e.value ? moneyFromRow(e.value as MoneyRow) : null,
    reportId: e.reportId,
    rejectionReason: e.rejectionReason,
    discrepancyDetected: e.discrepancyDetected,
    version: e.version,
  });
}
