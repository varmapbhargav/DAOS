import { FeeStructure, LiquidityTerms, Money, ProductStrategy, TenantId } from '@daos/shared-kernel';

import { InvestmentProduct } from '../../src/domain/aggregates/investment-product.aggregate';
import { MandateRuleEngine } from '../../src/domain/services/mandate-rule-engine';

const tenantId = TenantId.create('tenant-mandate');

const feeStructure: FeeStructure = {
  managementFeeAnnual: 2,
  performanceFee: 20,
  hurdleRate: 8,
  highWaterMark: true,
  catchUpPercentage: 10,
  catchUpRate: 20,
};

const liquidityTerms: LiquidityTerms = {
  redemptionFrequency: 'quarterly',
  lockUpMonths: 12,
  noticeperiodDays: 45,
  gating: 10,
};

const strategy: ProductStrategy = {
  investmentObjective: 'Long-biased growth',
  assetClasses: ['privateCredit'],
  geographies: ['US'],
  concentrationLimits: [{ type: 'singleInvestor', threshold: 25 }],
};

function activeProduct(productType: 'closedEndFund' | 'tokenizedBasket'): InvestmentProduct {
  const product = InvestmentProduct.design({
    tenantId,
    name: 'Test Fund',
    productType,
    strategy,
    liquidityTerms,
    feeStructure,
  });
  product.submitForApproval();
  product.approve('compliance-1');
  return product;
}

describe('MandateRuleEngine', () => {
  const engine = new MandateRuleEngine();

  it('accepts an eligible institutional investment below the concentration limit', () => {
    const product = activeProduct('closedEndFund');
    const result = engine.validate(product, {
      amount: Money.of(20_000_000n, 'USD'),
      investorType: 'institutional',
    });
    expect(result.valid).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it('rejects retail investors for professional-only product types', () => {
    const product = activeProduct('closedEndFund');
    const result = engine.validate(product, {
      amount: Money.of(20_000_000n, 'USD'),
      investorType: 'retail',
    });
    expect(result.valid).toBe(false);
    expect(result.violations).toContain('Retail investors are not eligible for closedEndFund products');
  });

  it('allows retail investors for non-professional product types', () => {
    const product = activeProduct('tokenizedBasket');
    const result = engine.validate(product, {
      amount: Money.of(20_000_000n, 'USD'),
      investorType: 'retail',
    });
    expect(result.valid).toBe(true);
  });

  it('flags an investment that exceeds the concentration limit', () => {
    const product = activeProduct('closedEndFund');
    const result = engine.validate(product, {
      amount: Money.of(30_000_000n, 'USD'),
      investorType: 'institutional',
    });
    expect(result.valid).toBe(false);
    expect(result.violations).toContain(
      'Investment exceeds singleInvestor concentration limit of 25%',
    );
  });

  it('rejects investments when the product is not active', () => {
    const product = InvestmentProduct.design({
      tenantId,
      name: 'Draft Fund',
      productType: 'closedEndFund',
      strategy,
      liquidityTerms,
      feeStructure,
    });
    const result = engine.validate(product, {
      amount: Money.of(20_000_000n, 'USD'),
      investorType: 'institutional',
    });
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.startsWith('Product is not active'))).toBe(true);
  });
});
