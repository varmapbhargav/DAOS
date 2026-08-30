import { CorporateActionStatus, CorporateActionType, DistributionStatus, DistributionType, WaterfallType } from '@daos/shared-kernel';

import { CorporateAction } from '../domain/aggregates/corporate-action.aggregate';
import { Distribution } from '../domain/aggregates/distribution.aggregate';
import { WaterfallModel } from '../domain/aggregates/waterfall-model.aggregate';
import { toMoneyDto } from './money.mapper';

export interface WaterfallModelDto {
  id: string;
  tenantId: string;
  name: string;
  waterfallType: WaterfallType;
  productId: string;
  status: string;
  tiers: { tierOrder: number; tierType: string; distributionRate: number | null; catchUpRate: number | null }[];
  version: number;
}

export interface DistributionDto {
  id: string;
  tenantId: string;
  productId: string;
  distributionType: DistributionType;
  currency: string;
  totalAmount: { amount: string; currency: string };
  recordDate: string;
  paymentDate: string;
  status: DistributionStatus;
  promote: { amount: string; currency: string };
  carriedInterest: { amount: string; currency: string };
  investorDistributions: {
    investorId: string;
    shareCount: number;
    grossAmount: { amount: string; currency: string };
    withholdingTax: { amount: string; currency: string };
    netAmount: { amount: string; currency: string };
  }[];
  version: number;
}

export interface CorporateActionDto {
  id: string;
  tenantId: string;
  issuanceId: string;
  type: CorporateActionType;
  exDate: string;
  recordDate: string;
  paymentDate: string;
  status: CorporateActionStatus;
  options: string[];
  elections: { investorId: string; electionType: string; electionDate: string }[];
  version: number;
}

export function toWaterfallModelDto(model: WaterfallModel): WaterfallModelDto {
  return {
    id: model.id.value,
    tenantId: model.tenantId.value,
    name: model.name,
    waterfallType: model.waterfallType,
    productId: model.productId,
    status: model.status,
    tiers: model.tiers.map((t) => ({
      tierOrder: t.tierOrder,
      tierType: t.tierType,
      distributionRate: t.distributionRate,
      catchUpRate: t.catchUpRate,
    })),
    version: model.version,
  };
}

export function toDistributionDto(d: Distribution): DistributionDto {
  return {
    id: d.id.value,
    tenantId: d.tenantId.value,
    productId: d.productId,
    distributionType: d.distributionType,
    currency: d.currency,
    totalAmount: { amount: d.totalAmount.toString(), currency: d.currency },
    recordDate: d.recordDate,
    paymentDate: d.paymentDate,
    status: d.status,
    promote: { amount: d.promote.toString(), currency: d.currency },
    carriedInterest: { amount: d.carriedInterest.toString(), currency: d.currency },
    investorDistributions: d.investorDistributions.map((id) => ({
      investorId: id.investorId,
      shareCount: id.shareCount,
      grossAmount: toMoneyDto(id.grossAmount),
      withholdingTax: toMoneyDto(id.withholdingTax),
      netAmount: toMoneyDto(id.netAmount),
    })),
    version: d.version,
  };
}

export function toCorporateActionDto(a: CorporateAction): CorporateActionDto {
  return {
    id: a.id.value,
    tenantId: a.tenantId.value,
    issuanceId: a.issuanceId,
    type: a.type,
    exDate: a.exDate,
    recordDate: a.recordDate,
    paymentDate: a.paymentDate,
    status: a.status,
    options: a.options,
    elections: a.elections.map((e) => ({
      investorId: e.investorId,
      electionType: e.electionType,
      electionDate: e.electionDate,
    })),
    version: a.version,
  };
}
