import { AggregateRoot } from '@daos/shared-kernel';
import { 
  InvestmentStrategy, 
  InvestmentStrategyVersion, 
  StrategyType, 
  StrategyStatus, 
  StrategyConstraint,
  StrategyEntry,
  StrategyOperating,
  StrategyFinancing,
  StrategyValueCreation,
  StrategyExit
} from '../value-objects/investment-strategy.vo';

// Re-export types
export type { 
  InvestmentStrategy, 
  InvestmentStrategyVersion, 
  StrategyType, 
  StrategyStatus, 
  StrategyConstraint,
  StrategyEntry,
  StrategyOperating,
  StrategyFinancing,
  StrategyValueCreation,
  StrategyExit
};

export class InvestmentStrategyAggregate extends AggregateRoot {
  private constructor(
    public readonly id: string,
    public readonly opportunityId: string,
    private _name: string,
    private _strategyType: StrategyType,
    private _description: string,
    private _status: StrategyStatus,
    private _entry: StrategyEntry,
    private _operating: StrategyOperating,
    private _financing: StrategyFinancing,
    private _valueCreation: StrategyValueCreation,
    private _exit: StrategyExit,
    private _investmentHorizonMonths: number,
    private _constraints: StrategyConstraint[],
    private _targetReturns: { targetIrr: any; targetMoic: any; targetCashYield: any },
    private _riskTolerance: any,
    private _createdBy: string,
    private _versions: InvestmentStrategyVersion[],
  ) {
    super();
  }

  static create(params: {
    id: string;
    opportunityId: string;
    name: string;
    strategyType: StrategyType;
    description: string;
    entry: StrategyEntry;
    operating: StrategyOperating;
    financing: StrategyFinancing;
    valueCreation: StrategyValueCreation;
    exit: StrategyExit;
    investmentHorizonMonths: number;
    constraints: StrategyConstraint[];
    targetReturns: { targetIrr: any; targetMoic: any; targetCashYield: any };
    riskTolerance: any;
    createdBy: string;
  }): InvestmentStrategyAggregate {
    const strategy = new InvestmentStrategyAggregate(
      params.id,
      params.opportunityId,
      params.name,
      params.strategyType,
      params.description,
      'draft',
      params.entry,
      params.operating,
      params.financing,
      params.valueCreation,
      params.exit,
      params.investmentHorizonMonths,
      params.constraints,
      params.targetReturns,
      params.riskTolerance,
      params.createdBy,
      [],
    );
    strategy.createVersion(params.createdBy, 'Initial creation');
    return strategy;
  }

  static reconstruct(params: {
    id: string;
    opportunityId: string;
    name: string;
    strategyType: StrategyType;
    description: string;
    status: StrategyStatus;
    entry: StrategyEntry;
    operating: StrategyOperating;
    financing: StrategyFinancing;
    valueCreation: StrategyValueCreation;
    exit: StrategyExit;
    investmentHorizonMonths: number;
    constraints: StrategyConstraint[];
    targetReturns: { targetIrr: any; targetMoic: any; targetCashYield: any };
    riskTolerance: any;
    version: number;
    createdBy: string;
    versions: InvestmentStrategyVersion[];
  }): InvestmentStrategyAggregate {
    const strategy = new InvestmentStrategyAggregate(
      params.id,
      params.opportunityId,
      params.name,
      params.strategyType,
      params.description,
      params.status,
      params.entry,
      params.operating,
      params.financing,
      params.valueCreation,
      params.exit,
      params.investmentHorizonMonths,
      params.constraints,
      params.targetReturns,
      params.riskTolerance,
      params.createdBy,
      params.versions ?? [],
    );
    (strategy as any)._version = params.version;
    return strategy;
  }

  // Getters
  get name(): string { return this._name; }
  get strategyType(): StrategyType { return this._strategyType; }
  get description(): string { return this._description; }
  get status(): StrategyStatus { return this._status; }
  get entry(): StrategyEntry { return { ...this._entry }; }
  get operating(): StrategyOperating { return { ...this._operating }; }
  get financing(): StrategyFinancing { return { ...this._financing }; }
  get valueCreation(): StrategyValueCreation { return { ...this._valueCreation }; }
  get exit(): StrategyExit { return { ...this._exit }; }
  get investmentHorizonMonths(): number { return this._investmentHorizonMonths; }
  get constraints(): StrategyConstraint[] { return [...this._constraints]; }
  get targetReturns(): any { return this._targetReturns; }
  get riskTolerance(): any { return this._riskTolerance; }
  get createdBy(): string { return this._createdBy; }
  get versions(): InvestmentStrategyVersion[] { return [...this._versions]; }
  get version(): number { return this._version; }

  private createVersion(createdBy: string, changeReason: string): void {
    const version: InvestmentStrategyVersion = {
      version: this._version,
      name: this._name,
      strategyType: this._strategyType,
      description: this._description,
      status: this._status,
      entry: { ...this._entry },
      operating: { ...this._operating },
      financing: { ...this._financing },
      valueCreation: { ...this._valueCreation },
      exit: { ...this._exit },
      investmentHorizonMonths: this._investmentHorizonMonths,
      constraints: [...this._constraints],
      targetReturns: { ...this._targetReturns },
      riskTolerance: this._riskTolerance,
      createdAt: new Date(),
      createdBy,
      changeReason,
    };
    this._versions.push(version);
  }

  updateName(name: string, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update name in draft status');
    this._name = name;
    this.incrementVersion();
    this.createVersion(createdBy, 'Name updated');
  }

  updateDescription(description: string, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update description in draft status');
    this._description = description;
    this.incrementVersion();
    this.createVersion(createdBy, 'Description updated');
  }

  updateEntry(entry: StrategyEntry, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update entry in draft status');
    this._entry = entry;
    this.incrementVersion();
    this.createVersion(createdBy, 'Entry strategy updated');
  }

  updateOperating(operating: StrategyOperating, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update operating in draft status');
    this._operating = operating;
    this.incrementVersion();
    this.createVersion(createdBy, 'Operating strategy updated');
  }

  updateFinancing(financing: StrategyFinancing, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update financing in draft status');
    this._financing = financing;
    this.incrementVersion();
    this.createVersion(createdBy, 'Financing strategy updated');
  }

  updateValueCreation(valueCreation: StrategyValueCreation, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update value creation in draft status');
    this._valueCreation = valueCreation;
    this.incrementVersion();
    this.createVersion(createdBy, 'Value creation updated');
  }

  updateExit(exit: StrategyExit, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update exit in draft status');
    this._exit = exit;
    this.incrementVersion();
    this.createVersion(createdBy, 'Exit strategy updated');
  }

  updateInvestmentHorizon(months: number, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update horizon in draft status');
    this._investmentHorizonMonths = months;
    this.incrementVersion();
    this.createVersion(createdBy, 'Investment horizon updated');
  }

  addConstraint(constraint: StrategyConstraint, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only add constraints in draft status');
    this._constraints.push(constraint);
    this.incrementVersion();
    this.createVersion(createdBy, `Constraint added: ${constraint.name}`);
  }

  removeConstraint(constraintId: string, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only remove constraints in draft status');
    this._constraints = this._constraints.filter(c => c.id !== constraintId);
    this.incrementVersion();
    this.createVersion(createdBy, 'Constraint removed');
  }

  updateTargetReturns(returns: { targetIrr: any; targetMoic: any; targetCashYield: any }, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update returns in draft status');
    this._targetReturns = returns;
    this.incrementVersion();
    this.createVersion(createdBy, 'Target returns updated');
  }

  updateRiskTolerance(tolerance: any, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update risk tolerance in draft status');
    this._riskTolerance = tolerance;
    this.incrementVersion();
    this.createVersion(createdBy, 'Risk tolerance updated');
  }

  activate(createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only activate from draft status');
    this._status = 'active';
    this.incrementVersion();
    this.createVersion(createdBy, 'Strategy activated');
  }

  select(createdBy: string): void {
    if (this._status !== 'active') throw new Error('Can only select active strategy');
    this._status = 'selected';
    this.incrementVersion();
    this.createVersion(createdBy, 'Strategy selected as recommended');
  }

  reject(createdBy: string): void {
    if (this._status === 'rejected') throw new Error('Strategy already rejected');
    this._status = 'rejected';
    this.incrementVersion();
    this.createVersion(createdBy, 'Strategy rejected');
  }

  archive(createdBy: string): void {
    this._status = 'archived';
    this.incrementVersion();
    this.createVersion(createdBy, 'Strategy archived');
  }

  getVersion(versionNumber: number): InvestmentStrategyVersion | null {
    return this._versions.find(v => v.version === versionNumber) ?? null;
  }

  compareVersions(v1: number, v2: number): Record<string, { old: unknown; new: unknown }> {
    const ver1 = this.getVersion(v1);
    const ver2 = this.getVersion(v2);
    if (!ver1 || !ver2) throw new Error('Version not found');

    const changes: Record<string, { old: unknown; new: unknown }> = {};
    const allKeys = new Set([
      ...Object.keys(ver1),
      ...Object.keys(ver2),
    ]);

    for (const key of allKeys) {
      const oldVal = (ver1 as any)[key];
      const newVal = (ver2 as any)[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes[key] = { old: oldVal, new: newVal };
      }
    }

    return changes;
  }
}