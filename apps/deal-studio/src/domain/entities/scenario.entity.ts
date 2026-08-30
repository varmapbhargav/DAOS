import { CashFlowPeriod, Money, ScenarioId } from '@daos/shared-kernel';

export type ScenarioType = 'BASE' | 'BULL' | 'BEAR' | 'STRESS';

export type ScenarioAssumptions = {
  revenueGrowthRate: number;        // percentage
  operatingMargin: number;          // percentage
  exitMultiple: number;             // e.g. 8.0x EBITDA
  discountRate: number;             // WACC / hurdle
  holdPeriodYears: number;
  interestRate: number;             // blended cost of debt
  inflationRate: number;
  customAssumptions: Record<string, number>;
};

export type ScenarioResult = {
  irr: number | null;
  moic: number | null;
  npv: Money | null;
  cashOnCash: number | null;
  equityMultiple: number | null;
  yield: number | null;
  calculatedAt: string;
};

export class Scenario {
  private constructor(
    public readonly id: ScenarioId,
    public readonly dealId: string,
    public readonly tenantId: string,
    private _type: ScenarioType,
    private _name: string,
    private _assumptions: ScenarioAssumptions,
    private _cashFlowPeriods: CashFlowPeriod[],
    private _result: ScenarioResult | null,
    private _version: number,
    public readonly createdBy: string,
    public readonly createdAt: string,
  ) {}

  static create(params: {
    dealId: string;
    tenantId: string;
    type: ScenarioType;
    name: string;
    assumptions: ScenarioAssumptions;
    createdBy: string;
  }): Scenario {
    return new Scenario(
      ScenarioId.create(),
      params.dealId,
      params.tenantId,
      params.type,
      params.name,
      params.assumptions,
      [],
      null,
      1,
      params.createdBy,
      new Date().toISOString(),
    );
  }

  static reconstruct(params: {
    id: ScenarioId;
    dealId: string;
    tenantId: string;
    type: ScenarioType;
    name: string;
    assumptions: ScenarioAssumptions;
    cashFlowPeriods: CashFlowPeriod[];
    result: ScenarioResult | null;
    version: number;
    createdBy: string;
    createdAt: string;
  }): Scenario {
    return new Scenario(
      params.id,
      params.dealId,
      params.tenantId,
      params.type,
      params.name,
      params.assumptions,
      params.cashFlowPeriods,
      params.result,
      params.version,
      params.createdBy,
      params.createdAt,
    );
  }

  get type(): ScenarioType { return this._type; }
  get name(): string { return this._name; }
  get assumptions(): ScenarioAssumptions { return this._assumptions; }
  get cashFlowPeriods(): CashFlowPeriod[] { return [...this._cashFlowPeriods]; }
  get result(): ScenarioResult | null { return this._result; }
  get version(): number { return this._version; }

  updateAssumptions(assumptions: ScenarioAssumptions): void {
    this._assumptions = assumptions;
    this._result = null; // invalidate cached result
    this._version += 1;
  }

  setCashFlows(periods: CashFlowPeriod[]): void {
    this._cashFlowPeriods = periods;
    this._result = null;
  }

  applyResult(result: ScenarioResult): void {
    this._result = result;
  }
}
