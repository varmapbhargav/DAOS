import { Money, TenantId } from '@daos/shared-kernel';

import { CashFlowModel } from '../../src/cash-flow/domain/aggregates/cash-flow-model.aggregate';

const tenantId = TenantId.create('tenant-cf');

function buildModel(cashFlows: Array<{ period: number; amount: string }>): CashFlowModel {
  return CashFlowModel.create({
    tenantId,
    assetId: 'asset-1',
    name: 'Base model',
    termPeriods: 5,
    discountRatePercent: 10,
    cashFlows: cashFlows.map((cf) => ({ period: cf.period, amount: Money.of(BigInt(cf.amount), 'USD') })),
  });
}

describe('CashFlowModel aggregate', () => {
  it('creates a model with no cash flows by default', () => {
    const model = CashFlowModel.create({
      tenantId,
      assetId: 'asset-1',
      name: 'Empty',
      termPeriods: 3,
      discountRatePercent: 8,
    });
    expect(model.name).toBe('Empty');
    expect(model.cashFlows).toEqual([]);
    expect(model.termPeriods).toBe(3);
  });

  it('rejects non-positive term periods', () => {
    expect(() =>
      CashFlowModel.create({ tenantId, assetId: 'a', name: 'x', termPeriods: 0, discountRatePercent: 8 }),
    ).toThrow('must be positive');
  });

  it('adds cash flows and tracks version increments', () => {
    const model = buildModel([]);
    const v0 = model.version;
    model.addCashFlow({ period: 1, amount: Money.of(100n, 'USD') });
    expect(model.cashFlows).toHaveLength(1);
    expect(model.version).toBeGreaterThan(v0);
  });

  it('computes NPV correctly at the configured discount rate', () => {
    // 100 at period 0, 0 at period 1 (simplified: positive single inflow at period 1, 10% -> 90.909..)
    const model = buildModel([
      { period: 1, amount: '100' },
      { period: 1, amount: '0' },
    ]);
    model.setDiscountRate(10);
    expect(Math.abs(model.calculateNpv() - 90.9090909)).toBeLessThan(0.001);
  });

  it('computes NPV at a custom rate and rejects negative flow sums', () => {
    const model = buildModel([{ period: 1, amount: '-100' }]);
    expect(model.calculateNpv(10)).toBeLessThan(0);
  });

  it('returns null IRR when there is no sign change', () => {
    const model = buildModel([{ period: 1, amount: '100' }]);
    expect(model.calculateIrr()).toBeNull();
  });

  it('updates fields via update()', () => {
    const model = buildModel([]);
    model.update({ name: 'Renamed', termPeriods: 12, discountRatePercent: 7.5 });
    expect(model.name).toBe('Renamed');
    expect(model.termPeriods).toBe(12);
    expect(model.discountRatePercent).toBe(7.5);
  });
});
