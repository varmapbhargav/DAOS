import { AggregateRoot, CashFlowModelId, Money, TenantId } from '@daos/shared-kernel';

import { CashFlowModelUpdated } from '../events/cash-flow-model-updated.event';

export type CashFlowRow = {
  period: number;
  amount: Money;
};

export class CashFlowModel extends AggregateRoot {
  private constructor(
    public readonly id: CashFlowModelId,
    public readonly tenantId: TenantId,
    public readonly assetId: string,
    private _name: string,
    private _termPeriods: number,
    private _cashFlows: CashFlowRow[],
    private _discountRatePercent: number,
  ) {
    super();
  }

  static create(params: {
    tenantId: TenantId;
    assetId: string;
    name: string;
    termPeriods: number;
    discountRatePercent: number;
    cashFlows?: CashFlowRow[];
  }): CashFlowModel {
    if (params.termPeriods <= 0) throw new Error('Term periods must be positive');
    const model = new CashFlowModel(
      CashFlowModelId.create(),
      params.tenantId,
      params.assetId,
      params.name,
      params.termPeriods,
      params.cashFlows ?? [],
      params.discountRatePercent,
    );
    model.incrementVersion();
    return model;
  }

  static reconstruct(params: {
    id: CashFlowModelId;
    tenantId: TenantId;
    assetId: string;
    name: string;
    termPeriods: number;
    cashFlows: CashFlowRow[];
    discountRatePercent: number;
    version: number;
  }): CashFlowModel {
    const model = new CashFlowModel(
      params.id,
      params.tenantId,
      params.assetId,
      params.name,
      params.termPeriods,
      params.cashFlows,
      params.discountRatePercent,
    );
    model._version = params.version;
    return model;
  }

  get name(): string {
    return this._name;
  }

  get termPeriods(): number {
    return this._termPeriods;
  }

  get cashFlows(): CashFlowRow[] {
    return [...this._cashFlows];
  }

  get discountRatePercent(): number {
    return this._discountRatePercent;
  }

  addCashFlow(row: CashFlowRow): void {
    this._cashFlows.push(row);
    this.incrementVersion();
  }

  update(params: { name?: string; termPeriods?: number; discountRatePercent?: number }): void {
    if (params.name !== undefined && params.name !== this._name) this._name = params.name;
    if (params.termPeriods !== undefined && params.termPeriods <= 0) {
      throw new Error('Term periods must be positive');
    }
    if (params.termPeriods !== undefined) this._termPeriods = params.termPeriods;
    if (params.discountRatePercent !== undefined) this._discountRatePercent = params.discountRatePercent;
    this.raise(new CashFlowModelUpdated(this.id.value, this.tenantId.value, this.assetId));
    this.incrementVersion();
  }

  setDiscountRate(percent: number): void {
    this._discountRatePercent = percent;
    this.raise(new CashFlowModelUpdated(this.id.value, this.tenantId.value, this.assetId));
    this.incrementVersion();
  }

  calculateNpv(ratePercent?: number): number {
    const effectiveRate = (ratePercent ?? this._discountRatePercent) / 100;
    let npv = 0;
    for (const cf of this._cashFlows) {
      npv += Number(cf.amount.amount) / Math.pow(1 + effectiveRate, cf.period);
    }
    return npv;
  }

  calculateIrr(): number | null {
    if (this._cashFlows.length === 0) return null;
    const min = -0.9999;
    const max = 100000;
    const tolerance = 1e-7;
    const maxIterations = 200;

    const npvAt = (rate: number): number => {
      let npv = 0;
      for (const cf of this._cashFlows) {
        npv += Number(cf.amount.amount) / Math.pow(1 + rate, cf.period);
      }
      return npv;
    };

    let low = min;
    let high = max;
    let fLow = npvAt(low);

    for (let i = 0; i < maxIterations; i++) {
      const mid = (low + high) / 2;
      const fMid = npvAt(mid);
      if (Math.abs(fMid) < tolerance) return mid * 100;
      if (fLow * fMid < 0) {
        high = mid;
      } else {
        low = mid;
        fLow = fMid;
      }
    }
    return null;
  }
}
