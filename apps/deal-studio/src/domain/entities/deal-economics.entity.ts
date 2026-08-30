import {
  CashFlowFrequency,
  CashFlowPeriod,
  DealEconomicsData,
  DealEconomicsId,
  Money,
  TenantId,
  Percentage,
} from '@daos/shared-kernel';

export class DealEconomics {
  private constructor(
    public readonly id: DealEconomicsId,
    public readonly dealId: string,
    public readonly tenantId: string,
    private _data: DealEconomicsData,
    private _cashFlowFrequency: CashFlowFrequency,
    private _cashFlowPeriods: CashFlowPeriod[],
    private _immutable: boolean,
  ) {}

  static create(params: {
    dealId: string;
    tenantId: string;
    data: DealEconomicsData;
    frequency?: CashFlowFrequency;
  }): DealEconomics {
    return new DealEconomics(
      DealEconomicsId.create(),
      params.dealId,
      params.tenantId,
      params.data,
      params.frequency ?? 'QUARTERLY',
      [],
      false,
    );
  }

  static reconstruct(params: {
    id: DealEconomicsId;
    dealId: string;
    tenantId: string;
    data: DealEconomicsData;
    frequency: CashFlowFrequency;
    cashFlowPeriods: CashFlowPeriod[];
    immutable: boolean;
  }): DealEconomics {
    return new DealEconomics(
      params.id,
      params.dealId,
      params.tenantId,
      params.data,
      params.frequency,
      params.cashFlowPeriods,
      params.immutable,
    );
  }

  get data(): DealEconomicsData { return this._data; }
  get cashFlowFrequency(): CashFlowFrequency { return this._cashFlowFrequency; }
  get cashFlowPeriods(): CashFlowPeriod[] { return [...this._cashFlowPeriods]; }
  get immutable(): boolean { return this._immutable; }

  updateData(data: DealEconomicsData): void {
    if (this._immutable) throw new Error('Economics are locked after deal closure');
    this._data = data;
  }

  setCashFlowPeriods(periods: CashFlowPeriod[], frequency: CashFlowFrequency): void {
    if (this._immutable) throw new Error('Economics are locked after deal closure');
    this._cashFlowPeriods = periods;
    this._cashFlowFrequency = frequency;
  }

  lock(): void {
    this._immutable = true;
  }
