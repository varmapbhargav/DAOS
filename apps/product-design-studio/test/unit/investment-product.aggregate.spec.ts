import { Benchmark, FeeStructure, InvestmentProductId, LiquidityTerms, Money, ProductStrategy, TenantId } from '@daos/shared-kernel';

import { InvestmentProduct } from '../../src/domain/aggregates/investment-product.aggregate';

const tenantId = TenantId.create('tenant-product');

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

const benchmark: Benchmark = { benchmarkName: 'Bloomberg US Agg', indexRef: 'LBUSTRUU' };

function design(): InvestmentProduct {
  return InvestmentProduct.design({
    tenantId,
    name: 'Aurora Private Credit Fund II',
    productType: 'closedEndFund',
    strategy,
    benchmark,
    liquidityTerms,
    feeStructure,
  });
}

describe('InvestmentProduct aggregate', () => {
  it('designs in design status with a product designed event', () => {
    const product = design();
    expect(product.status).toBe('design');
    expect(product.name).toBe('Aurora Private Credit Fund II');
    expect(product.shareClassIds).toEqual([]);
    const events = product.pullEvents();
    expect(events.map((e) => e.eventType)).toContain('product.designed.v1');
  });

  it('requires a non-empty name', () => {
    expect(() =>
      InvestmentProduct.design({ tenantId, name: '   ', productType: 'closedEndFund', strategy, liquidityTerms, feeStructure }),
    ).toThrow('Product name is required');
  });

  it('approves only after the product has been submitted', () => {
    const product = design();
    expect(() => product.approve('compliance-1')).toThrow('submitted for approval');
    product.submitForApproval();
    expect(product.status).toBe('internalReview');
    product.approve('compliance-1');
    expect(product.status).toBe('active');
    expect(product.approvedBy).toBe('compliance-1');
    expect(product.pullEvents().map((e) => e.eventType)).toContain('product.approved.v1');
  });

  it('records a fee structure approved event', () => {
    const product = design();
    product.approveFeeStructure();
    expect(product.pullEvents().map((e) => e.eventType)).toContain('product.fee-structure.approved.v1');
  });

  it('closes only after leaving design, recording a product closed event', () => {
    const product = design();
    expect(() => product.close()).toThrow('Designed products cannot be closed');
    product.submitForApproval();
    product.close();
    expect(product.status).toBe('closed');
    expect(product.pullEvents().map((e) => e.eventType)).toContain('product.closed.v1');
  });

  it('refuses to approve or mutate an already closed product', () => {
    const product = design();
    product.submitForApproval();
    product.close();
    expect(() => product.approve('compliance-1')).toThrow('Closed products cannot be approved');
    expect(() => product.addShareClass('share-1')).toThrow('Closed products cannot add share classes');
  });

  it('adds share class ids', () => {
    const product = design();
    product.addShareClass('share-a');
    product.addShareClass('share-b');
    expect(product.shareClassIds).toEqual(['share-a', 'share-b']);
    expect(() => product.addShareClass('share-a')).toThrow('already added');
  });

  it('reconstructs from persisted state preserving version', () => {
    const original = design();
    original.submitForApproval();
    const clone = InvestmentProduct.reconstruct({
      id: InvestmentProductId.create(original.id.value),
      tenantId: original.tenantId,
      name: original.name,
      productType: original.productType,
      strategy: original.strategy,
      benchmark: original.benchmark,
      liquidityTerms: original.liquidityTerms,
      feeStructure: original.feeStructure,
      status: original.status,
      shareClassIds: original.shareClassIds,
      approvedBy: null,
      rejectionReason: null,
      version: original.version,
    });
    expect(clone.version).toBe(original.version);
    expect(clone.status).toBe('internalReview');
    expect(clone.name).toBe('Aurora Private Credit Fund II');
  });
});
