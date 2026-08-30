import { Money, TenantId, ValuationModelId, ValuationModelType } from '@daos/shared-kernel';

import { ValuationModel } from '../../src/domain/aggregates/valuation-model.aggregate';

describe('ValuationModel aggregate', () => {
  const tenantId = TenantId.create('tenant-1');

  function initiate() {
    return ValuationModel.initiate({
      tenantId,
      assetId: 'asset-1',
      methodology: 'DCF' as ValuationModelType,
    });
  }

  it('initiates a valuation model in status initiated', () => {
    const model = initiate();
    expect(model.id).toBeInstanceOf(ValuationModelId);
    expect(model.status).toBe('initiated');
    expect(model.value).toBeNull();
  });

  it('rejects invalid initiate parameters', () => {
    expect(() =>
      ValuationModel.initiate({ tenantId, assetId: ' ', methodology: 'DCF' as ValuationModelType }),
    ).toThrow('Asset id is required');
  });

  it('runs a valuation and raises ValuationModelRun', () => {
    const model = initiate();
    model.pullEvents();
    model.runValuation({ value: Money.of(1_200_000n, 'USD'), reportId: 'report-1' });

    expect(model.status).toBe('run');
    expect(model.value?.amount).toBe(1_200_000n);
    expect(model.pullEvents().map((e) => e.eventType)).toContain('valuation.model-run.v1');
  });

  it('detects a discrepancy and raises ValuationDiscrepancyDetected', () => {
    const model = initiate();
    model.pullEvents();
    model.runValuation({ value: Money.of(1_200_000n, 'USD'), reportId: 'report-1' });
    model.pullEvents();
    model.detectDiscrepancy(Money.of(990_000n, 'USD'));

    expect(model.discrepancyDetected).toBe(true);
    expect(model.pullEvents().map((e) => e.eventType)).toContain('valuation.discrepancy-detected.v1');
  });

  it('approves a run valuation and raises ValuationApproved', () => {
    const model = initiate();
    model.pullEvents();
    model.runValuation({ value: Money.of(1_200_000n, 'USD'), reportId: 'report-1' });
    model.pullEvents();
    model.approve();

    expect(model.status).toBe('approved');
    expect(model.pullEvents().map((e) => e.eventType)).toContain('valuation.approved.v1');
  });

  it('rejects a run valuation and raises ValuationRejected', () => {
    const model = initiate();
    model.pullEvents();
    model.runValuation({ value: Money.of(1_200_000n, 'USD'), reportId: 'report-1' });
    model.pullEvents();
    model.reject('insufficient evidence');

    expect(model.status).toBe('rejected');
    expect(model.rejectionReason).toBe('insufficient evidence');
    expect(model.pullEvents().map((e) => e.eventType)).toContain('valuation.rejected.v1');
  });

  it('refuses to approve an un-run valuation', () => {
    const model = initiate();
    expect(() => model.approve()).toThrow('Only run valuations can be approved');
  });
});
