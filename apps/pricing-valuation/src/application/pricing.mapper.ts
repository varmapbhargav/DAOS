import { FairValueHierarchy, PricingSource, ValuationModelType } from '@daos/shared-kernel';

import { Price } from '../domain/aggregates/price.aggregate';
import { ValuationModel } from '../domain/aggregates/valuation-model.aggregate';
import { toMoneyDto } from './money.mapper';

export interface PriceDto {
  id: string;
  tenantId: string;
  isin: string;
  price: { amount: string; currency: string };
  source: PricingSource;
  fairValueHierarchy: FairValueHierarchy;
  lastUpdatedAt: string;
  isStale: boolean;
  version: number;
}

export interface PriceHistoryPointDto {
  isin: string;
  currency: string;
  price: { amount: string; currency: string };
  timestamp: string;
}

export interface ValuationModelDto {
  id: string;
  tenantId: string;
  assetId: string;
  methodology: ValuationModelType;
  status: string;
  value: { amount: string; currency: string } | null;
  reportId: string | null;
  rejectionReason: string | null;
  discrepancyDetected: boolean;
  version: number;
}

export function toPriceDto(price: Price): PriceDto {
  return {
    id: price.id.value,
    tenantId: price.tenantId.value,
    isin: price.isin,
    price: toMoneyDto(price.price),
    source: price.source,
    fairValueHierarchy: price.fairValueHierarchy,
    lastUpdatedAt: price.lastUpdatedAt,
    isStale: price.isStale,
    version: price.version,
  };
}

export function toPriceHistoryPointDto(row: {
  isin: string;
  currency: string;
  price: string;
  timestamp: string;
}): PriceHistoryPointDto {
  return {
    isin: row.isin,
    currency: row.currency,
    price: { amount: row.price, currency: row.currency },
    timestamp: row.timestamp,
  };
}

export function toValuationModelDto(model: ValuationModel): ValuationModelDto {
  return {
    id: model.id.value,
    tenantId: model.tenantId.value,
    assetId: model.assetId,
    methodology: model.methodology,
    status: model.status,
    value: model.value ? toMoneyDto(model.value) : null,
    reportId: model.reportId,
    rejectionReason: model.rejectionReason,
    discrepancyDetected: model.discrepancyDetected,
    version: model.version,
  };
}
