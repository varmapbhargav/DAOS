import { InvestmentProduct } from '../domain/aggregates/investment-product.aggregate';
import { ShareClass } from '../domain/entities/share-class.aggregate';

export type MoneyDto = {
  amountMinorUnits: string;
  currency: string;
};

export type ShareClassDto = {
  id: string;
  productId: string;
  name: string;
  currency: string;
  targetSize: MoneyDto;
  minInvestment: MoneyDto;
  maxInvestors: number;
  pricePerShare: MoneyDto | null;
  status: string;
  version: number;
};

export type ProductDto = {
  id: string;
  tenantId: string;
  name: string;
  productType: string;
  strategy: {
    investmentObjective: string;
    assetClasses: string[];
    geographies: string[];
    concentrationLimits: { type: string; threshold: number }[];
  };
  benchmark: { benchmarkName: string; indexRef: string } | null;
  liquidityTerms: {
    redemptionFrequency: string;
    lockUpMonths: number;
    noticeperiodDays: number;
    gating: number;
  };
  feeStructure: {
    managementFeeAnnual: number;
    performanceFee: number;
    hurdleRate: number;
    highWaterMark: boolean;
    catchUpPercentage: number;
    catchUpRate: number;
  };
  status: string;
  shareClassIds: string[];
  approvedBy: string | null;
  rejectionReason: string | null;
  version: number;
};

export function toProductDto(product: InvestmentProduct): ProductDto {
  return {
    id: product.id.value,
    tenantId: product.tenantId.value,
    name: product.name,
    productType: product.productType,
    strategy: {
      investmentObjective: product.strategy.investmentObjective,
      assetClasses: product.strategy.assetClasses,
      geographies: product.strategy.geographies,
      concentrationLimits: product.strategy.concentrationLimits,
    },
    benchmark: product.benchmark
      ? { benchmarkName: product.benchmark.benchmarkName, indexRef: product.benchmark.indexRef }
      : null,
    liquidityTerms: product.liquidityTerms,
    feeStructure: product.feeStructure,
    status: product.status,
    shareClassIds: product.shareClassIds,
    approvedBy: product.approvedBy,
    rejectionReason: product.rejectionReason,
    version: product.version,
  };
}

export function toShareClassDto(shareClass: ShareClass): ShareClassDto {
  return {
    id: shareClass.id.value,
    productId: shareClass.productId,
    name: shareClass.name,
    currency: shareClass.currency,
    targetSize: {
      amountMinorUnits: shareClass.targetSize.amount.toString(),
      currency: shareClass.targetSize.currency,
    },
    minInvestment: {
      amountMinorUnits: shareClass.minInvestment.amount.toString(),
      currency: shareClass.minInvestment.currency,
    },
    maxInvestors: shareClass.maxInvestors,
    pricePerShare: shareClass.pricePerShare
      ? {
          amountMinorUnits: shareClass.pricePerShare.amount.toString(),
          currency: shareClass.pricePerShare.currency,
        }
      : null,
    status: shareClass.status,
    version: shareClass.version,
  };
}
