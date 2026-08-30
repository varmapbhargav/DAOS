// Compliance ports
export interface ComplianceRuleRepository {
  save(rule: ComplianceRule): Promise<void>;
  findById(id: string): Promise<ComplianceRule | null>;
  listByTenant(tenantId: string): Promise<ComplianceRule[]>;
  listByType(ruleType: ComplianceRuleType): Promise<ComplianceRule[]>;
}

export interface RegulatoryFilingRepository {
  save(filing: RegulatoryFiling): Promise<void>;
  findById(id: string): Promise<RegulatoryFiling | null>;
  listByTenant(tenantId: string): Promise<RegulatoryFiling[]>;
}

export interface InvestorCountRepository {
  save(count: InvestorCount): Promise<void>;
  findById(id: string): Promise<InvestorCount | null>;
  listByProductId(productId: string): Promise<InvestorCount[]>;
}

export interface ComplianceRuleEngine {
  check(
    action: string,
    investorId: string,
    productId: string,
    amount: Money,
  ): { compliant: boolean; violations: ComplianceViolation[] };
}

export interface BeneficialOwnershipMonitor {
  track(entityId: string, owners: BeneficialOwner[]): {
    breached: boolean;
    thresholds: Record<string, number>;
  };
}

export type ComplianceViolation = {
  ruleType: ComplianceRuleType;
  threshold: number;
  currentValue: number;
  description: string;
};
