import { Injectable } from '@nestjs/common';

import { ComplianceRuleRepository } from '../repositories/compliance-rule.repository';

@Injectable()
export class ComplianceRuleService {
  constructor(private readonly repo: ComplianceRuleRepository) {}

  async check(action: string, investorId: string, productId: string, amount: number): Promise<{
    compliant: boolean;
    violations: ComplianceViolation[];
  }> {
    const rules = await this.repo.listByTenant('default');
    const violations: ComplianceViolation[] = [];

    for (const rule of rules) {
      if (!rule.isActive) continue;
      const threshold = rule.threshold ?? 100;
      const violation = this.evaluateRule(rule, action, investorId, productId, amount, threshold);
      if (violation) violations.push(violation);
    }

    return { compliant: violations.length === 0, violations };
  }

  private evaluateRule(
    rule: { ruleType: string },
    action: string,
    investorId: string,
    productId: string,
    amount: number,
    threshold: number,
  ): ComplianceViolation | null {
    return null;
  }
}

export type ComplianceViolation = {
  ruleType: string;
  threshold: number;
  currentValue: number;
  description: string;
};
