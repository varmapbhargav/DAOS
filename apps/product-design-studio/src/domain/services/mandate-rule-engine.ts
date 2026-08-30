import { Money, ProductStatus, ProductType } from '@daos/shared-kernel';

import { InvestmentProduct } from '../aggregates/investment-product.aggregate';

export type InvestmentRequest = {
  amount: Money;
  investorType: string;
};

export type MandateValidationResult = {
  valid: boolean;
  violations: string[];
};

const PROFESSIONAL_ONLY_TYPES: ProductType[] = [
  'closedEndFund',
  'openEndFund',
  'feedFund',
  'SPV',
  'BDC',
];

// Nominal committed size, in minor units, used to interpret concentration
// limit thresholds (percentages).
const NOMINAL_FUND_MINOR_UNITS = 100_000_000n;

/**
 * Validates an investment request against a product's mandate rules such as
 * investor-type eligibility and concentration limits.
 */
export class MandateRuleEngine {
  validate(product: InvestmentProduct, investment: InvestmentRequest): MandateValidationResult {
    const violations: string[] = [];

    if (product.status === 'closed') {
      violations.push('Product is closed to new investments');
    } else if (product.status !== 'active') {
      violations.push(`Product is not active for investments (status: ${product.status as ProductStatus})`);
    }

    if (investment.investorType === 'retail' && PROFESSIONAL_ONLY_TYPES.includes(product.productType)) {
      violations.push(`Retail investors are not eligible for ${product.productType} products`);
    }

    for (const limit of product.strategy.concentrationLimits) {
      const maxMinorUnits = BigInt(limit.threshold) * (NOMINAL_FUND_MINOR_UNITS / 100n);
      if (investment.amount.amount > maxMinorUnits) {
        violations.push(
          `Investment exceeds ${limit.type} concentration limit of ${limit.threshold}%`,
        );
      }
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }
}
