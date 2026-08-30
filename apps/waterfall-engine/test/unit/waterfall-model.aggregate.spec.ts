import { TenantId, WaterfallModelId, WaterfallType } from '@daos/shared-kernel';

import { WaterfallModel } from '../../src/domain/aggregates/waterfall-model.aggregate';

describe('WaterfallModel aggregate', () => {
  const tenantId = TenantId.create('tenant-1');

  function createModel(overrides: Partial<Parameters<typeof WaterfallModel.create>[0]> = {}) {
    return WaterfallModel.create({
      tenantId,
      name: 'Series A Waterfall',
      waterfallType: 'european' as WaterfallType,
      productId: 'product-1',
      tiers: [{ tierOrder: 0, tierType: 'preferredReturn', distributionRate: 8, catchUpRate: null }],
      ...overrides,
    });
  }

  it('creates a draft waterfall model and sorts tiers by order', () => {
    const model = createModel({
      tiers: [
        { tierOrder: 1, tierType: 'commonEquity', distributionRate: null, catchUpRate: null },
        { tierOrder: 0, tierType: 'preferredReturn', distributionRate: 8, catchUpRate: null },
      ],
    });

    expect(model.id).toBeInstanceOf(WaterfallModelId);
    expect(model.status).toBe('draft');
    expect(model.tiers[0].tierType).toBe('preferredReturn');
    expect(model.pullEvents()).toHaveLength(0);
  });

  it('rejects invalid creation parameters', () => {
    expect(() => createModel({ name: '  ' })).toThrow('Waterfall model name is required');
    expect(() => createModel({ productId: '' })).toThrow('Product id is required');
    expect(() => createModel({ tiers: [] })).toThrow('At least one waterfall tier is required');
  });

  it('approves a model and raises WaterfallModelApproved', () => {
    const model = createModel();
    model.pullEvents();
    model.approve();

    expect(model.status).toBe('approved');
    expect(model.pullEvents().map((e) => e.eventType)).toContain('waterfall.model-approved.v1');
  });

  it('refuses to approve twice', () => {
    const model = createModel();
    model.pullEvents();
    model.approve();
    model.pullEvents();
    expect(() => model.approve()).toThrow('Waterfall model already approved');
  });
});
