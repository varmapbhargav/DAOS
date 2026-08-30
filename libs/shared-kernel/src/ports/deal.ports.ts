// Deal Structuring & Legal Entity ports
export interface DealRepository {
  save(deal: Deal): Promise<void>;
  findById(id: string): Promise<Deal | null>;
  listByTenant(tenantId: string): Promise<Deal[]>;
}

export interface TermSheetRepository {
  save(termSheet: TermSheet): Promise<void>;
  findById(id: string): Promise<TermSheet | null>;
  findByDealId(dealId: string): Promise<TermSheet | null>;
}

export interface LegalEntityRepository {
  save(entity: LegalEntity): Promise<void>;
  findById(id: string): Promise<LegalEntity | null>;
  listByTenant(tenantId: string): Promise<LegalEntity[]>;
}

export interface CorporateDocumentRepository {
  save(doc: CorporateDocument): Promise<void>;
  findById(id: string): Promise<CorporateDocument | null>;
  findByEntityId(entityId: string): Promise<CorporateDocument[]>;
}

export interface InvestmentProductRepository {
  save(product: InvestmentProduct): Promise<void>;
  findById(id: string): Promise<InvestmentProduct | null>;
  listByTenant(tenantId: string): Promise<InvestmentProduct[]>;
}

export interface ShareClassRepository {
  save(cls: ShareClass): Promise<void>;
  findById(id: string): Promise<ShareClass | null>;
  findByProductId(productId: string): Promise<ShareClass[]>;
}

export interface CapitalStackValidator {
  validate(stack: CapitalStack): { valid: boolean; errors: string[] };
  calculateTotal(stack: CapitalStack): Money;
}

export interface ClosingConditionChecker {
  check(deal: Deal): { allMet: boolean; pending: string[] };
}

export interface FeeModelCalculator {
  calculate(
    grossAmount: Money,
    feeStructure: FeeStructure,
  ): {
    managementFee: Money;
    performanceFee: Money;
    carriedInterest: Money;
    netToInvestor: Money;
  };
}

export interface MandateRuleEngine {
  validate(product: InvestmentProduct, investment: Investment): { valid: boolean; violations: string[] };
}
