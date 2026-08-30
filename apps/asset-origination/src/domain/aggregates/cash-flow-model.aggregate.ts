import { AggregateRoot, CashFlowModelId, Money, TenantId } from '@daos/shared-kernel';

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

  setDiscountRate(percent: number): void {
    this._discountRatePercent = percent;
    this.incrementVersion();
  }
}
