import { CapitalStack, CapitalTranche, CapitalTrancheType, Money } from '@daos/shared-kernel';

export type CapitalStackValidation = {
  valid: boolean;
  errors: string[];
};

const VALID_TRANCHE_TYPES: CapitalTrancheType[] = [
  'SENIOR_DEBT',
  'MEZZANINE_DEBT',
  'JUNIOR_DEBT',
  'PREFERRED_EQUITY',
  'COMMON_EQUITY',
  'CONVERTIBLE_INSTRUMENT',
  'REVENUE_PARTICIPATION',
  'HYBRID_INSTRUMENT',
];

const MAX_LEVERAGE_RATIO = 10; // 10x debt/equity

export class CapitalStackValidator {
  validate(stack: CapitalStack): CapitalStackValidation {
    const errors: string[] = [];

    if (!stack.tranches || stack.tranches.length === 0) {
      errors.push('Capital stack must contain at least one tranche');
      return { valid: false, errors };
    }

    const rankingSeen = new Set<number>();
    let totalDebt = 0n;
    let totalEquity = 0n;
    let currency: string | null = null;

    for (let i = 0; i < stack.tranches.length; i++) {
      const t = stack.tranches[i];

      if (!VALID_TRANCHE_TYPES.includes(t.type)) {
        errors.push(`Tranche ${i + 1}: invalid type "${t.type}"`);
      }

      if (t.targetAmount.amount <= 0n) {
        errors.push(`Tranche ${i + 1} (${t.name}): target amount must be positive`);
      }

      if (t.seniority < 1) {
        errors.push(`Tranche ${i + 1} (${t.name}): seniority must be >= 1`);
      }

      if (t.ranking < 1) {
        errors.push(`Tranche ${i + 1} (${t.name}): ranking must be >= 1`);
      }

      if (rankingSeen.has(t.ranking)) {
        errors.push(`Tranche ${i + 1} (${t.name}): duplicate ranking ${t.ranking}`);
      }
      rankingSeen.add(t.ranking);

      // Currency consistency
      if (currency === null) {
        currency = t.currency;
      } else if (t.currency !== currency) {
        errors.push(
          `Tranche ${i + 1} (${t.name}): currency mismatch — expected ${currency}, got ${t.currency}`,
        );
      }

      // Interest rate validation
      const econ = t.economics;
      if (econ.interestRateType === 'FIXED' && econ.fixedRate === null) {
        errors.push(`Tranche ${i + 1} (${t.name}): fixed rate required for FIXED interest type`);
      }
      if (econ.interestRateType === 'FLOATING') {
        if (!econ.floatingReferenceRate) {
          errors.push(`Tranche ${i + 1} (${t.name}): reference rate required for FLOATING interest type`);
        }
        if (econ.spread === null) {
          errors.push(`Tranche ${i + 1} (${t.name}): spread required for FLOATING interest type`);
        }
      }

      // Accumulate debt vs equity
      const isDebt = ['SENIOR_DEBT', 'MEZZANINE_DEBT', 'JUNIOR_DEBT'].includes(t.type);
      const isEquity = ['PREFERRED_EQUITY', 'COMMON_EQUITY'].includes(t.type);
      if (isDebt) totalDebt += t.targetAmount.amount;
      if (isEquity) totalEquity += t.targetAmount.amount;
    }

    // Leverage validation
    if (totalEquity > 0n) {
      // Use integer approximation: leverage = debt / equity
      const leverageX10 = Number((totalDebt * 10n) / totalEquity);
      if (leverageX10 > MAX_LEVERAGE_RATIO * 10) {
        errors.push(
          `Capital stack exceeds maximum leverage ratio of ${MAX_LEVERAGE_RATIO}x (actual: ${(leverageX10 / 10).toFixed(1)}x)`,
        );
      }
    }

    // Minimum equity check when debt is present
    if (totalDebt > 0n && totalEquity === 0n) {
      errors.push('Capital stack with debt must include at least one equity tranche');
    }

    return { valid: errors.length === 0, errors };
  }

  calculateTotal(stack: CapitalStack): Money {
    if (!stack.tranches || stack.tranches.length === 0) {
      return Money.zero('USD');
    }
    const currency = stack.tranches[0].currency;
    let total = Money.zero(currency);
    for (const tranche of stack.tranches) {
      total = total.add(tranche.targetAmount);
    }
    return total;
  }

  calculateFundedAmount(stack: CapitalStack): Money {
    if (!stack.tranches || stack.tranches.length === 0) {
      return Money.zero('USD');
    }
    const currency = stack.tranches[0].currency;
    let total = Money.zero(currency);
    for (const tranche of stack.tranches) {
      if (tranche.fundedAmount) {
        total = total.add(tranche.fundedAmount);
      }
    }
    return total;
  }

  sortBySeniority(stack: CapitalStack): CapitalTranche[] {
    return [...stack.tranches].sort((a, b) => a.seniority - b.seniority || a.ranking - b.ranking);
  }
}
