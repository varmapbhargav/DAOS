// Waterfall Engine ports
export interface WaterfallModelRepository {
  save(model: WaterfallModel): Promise<void>;
  findById(id: string): Promise<WaterfallModel | null>;
  listByTenant(tenantId: string): Promise<WaterfallModel[]>;
}

export interface DistributionRepository {
  save(dist: Distribution): Promise<void>;
  findById(id: string): Promise<Distribution | null>;
  listByProductId(productId: string): Promise<Distribution[]>;
}

export interface CorporateActionRepository {
  save(ca: CorporateAction): Promise<void>;
  findById(id: string): Promise<CorporateAction | null>;
  listByIssuance(issuanceId: string): Promise<CorporateAction[]>;
}

export interface WaterfallCalculationService {
  calculate(
    model: WaterfallModel,
    investors: InvestorHolding[],
    distributionAmount: Money,
  ): {
    tierDistributions: TierDistribution[];
    promote: Money;
    carriedInterest: Money;
  };
}

export interface TaxWithholdingCalculator {
  calculate(
    grossAmount: Money,
    investorTaxInfo: InvestorTaxInfo,
  ): {
    withholding: Money;
    netAmount: Money;
    taxCode: string;
  };
}

export type InvestorHolding = {
  investorId: string;
  shareCount: bigint;
  shareClass: string;
};

export type TierDistribution = {
  tierOrder: number;
  tierType: string;
  amount: Money;
};

export type InvestorTaxInfo = {
  jurisdiction: string;
  taxIdType: string;
  taxId: string;
  isResident: boolean;
  treatyBenefits: Record<string, boolean>;
};
