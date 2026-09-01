import {
  AggregateRoot,
  ScenarioModelId,
  ScenarioType,
  TenantId,
} from '@daos/shared-kernel';
import { FinancialModel } from '../value-objects/financial-model.vo';
import { AssumptionSet } from '../value-objects/assumption.vo';
import { FinancialModelEngine } from '../services/financial-model-engine';
import { ModelVersion } from '../value-objects/model-version.vo';
import { CalculationProvenance } from '../value-objects/calculation-result.vo';

export type ScenarioStatus =
  | 'draft'
  | 'modeling'
  | 'calculated'
  | 'simulated'
  | 'reviewed'
  | 'selected'
  | 'rejected'
  | 'archived';

export type ScenarioVersion = {
  version: number;
  name: string;
  scenarioType: ScenarioType;
  status: ScenarioStatus;
  assumptions: AssumptionSet | null;
  financialModel: FinancialModel | null;
  holdPeriodMonths: number;
  isSelected: boolean;
  createdAt: Date;
  createdBy: string;
  changeReason: string;
};

export class ScenarioModel extends AggregateRoot {
  private constructor(
    public readonly id: ScenarioModelId,
    public readonly tenantId: TenantId,
    public readonly opportunityId: string,
    public readonly strategyId: string | null,
    private _name: string,
    private _scenarioType: ScenarioType,
    private _status: ScenarioStatus,
    private _assumptions: AssumptionSet | null,
    private _financialModel: FinancialModel | null,
    private _holdPeriodMonths: number,
    private _isSelected: boolean,
    private _versions: ScenarioVersion[],
  ) {
    super();
  }

  static create(params: {
    tenantId: TenantId;
    opportunityId: string;
    strategyId: string | null;
    name: string;
    scenarioType: ScenarioType;
    holdPeriodMonths: number;
  }): ScenarioModel {
    const model = new ScenarioModel(
      ScenarioModelId.create(),
      params.tenantId,
      params.opportunityId,
      params.strategyId,
      params.name,
      params.scenarioType,
      'draft',
      null,
      null,
      params.holdPeriodMonths,
      false,
      [],
    );
    return model;
  }

  static reconstruct(params: {
    id: ScenarioModelId;
    tenantId: TenantId;
    opportunityId: string;
    strategyId: string | null;
    name: string;
    scenarioType: ScenarioType;
    status: ScenarioStatus;
    assumptions: AssumptionSet | null;
    financialModel: FinancialModel | null;
    holdPeriodMonths: number;
    isSelected: boolean;
    versions: ScenarioVersion[];
  }): ScenarioModel {
    const model = new ScenarioModel(
      params.id,
      params.tenantId,
      params.opportunityId,
      params.strategyId,
      params.name,
      params.scenarioType,
      params.status,
      params.assumptions,
      params.financialModel,
      params.holdPeriodMonths,
      params.isSelected,
      params.versions ?? [],
    );
    return model;
  }

  get name(): string {
    return this._name;
  }

  get scenarioType(): ScenarioType {
    return this._scenarioType;
  }

  get status(): ScenarioStatus {
    return this._status;
  }

  get assumptions(): AssumptionSet | null {
    return this._assumptions;
  }

  get financialModel(): FinancialModel | null {
    return this._financialModel;
  }

  get holdPeriodMonths(): number {
    return this._holdPeriodMonths;
  }

  get isSelected(): boolean {
    return this._isSelected;
  }

  

  get versions(): ScenarioVersion[] {
    return [...this._versions];
  }

  private createVersion(createdBy: string, changeReason: string): void {
    const version: ScenarioVersion = {
      version: this._version,
      name: this._name,
      scenarioType: this._scenarioType,
      status: this._status,
      assumptions: this._assumptions ? JSON.parse(JSON.stringify(this._assumptions)) : null,
      financialModel: this._financialModel ? JSON.parse(JSON.stringify(this._financialModel)) : null,
      holdPeriodMonths: this._holdPeriodMonths,
      isSelected: this._isSelected,
      createdAt: new Date(),
      createdBy,
      changeReason,
    };
    this._versions.push(version);
  }

  setAssumptions(assumptions: AssumptionSet, createdBy: string): void {
    if (this._status !== 'draft' && this._status !== 'modeling') {
      throw new Error('Can only set assumptions in draft or modeling status');
    }
    this.createVersion(createdBy, 'Assumptions updated');
    this._assumptions = assumptions;
    this._status = 'modeling';
    this.incrementVersion();
  }

  calculate(createdBy: string, opportunityId: string): { model: FinancialModel; provenance: CalculationProvenance } {
    if (!this._assumptions) {
      throw new Error('Assumptions must be set before calculation');
    }
    if (this._status !== 'modeling' && this._status !== 'calculated') {
      throw new Error('Can only calculate in modeling or calculated status');
    }

    const engine = new FinancialModelEngine();
    const result = engine.calculate(this._assumptions, this._holdPeriodMonths, opportunityId, this.id.value, createdBy);
    this.createVersion(createdBy, 'Financial model calculated');
    this._financialModel = result.model;
    this._status = 'calculated';
    this.incrementVersion();
    return result;
  }

  select(createdBy: string): void {
    if (this._status !== 'calculated' && this._status !== 'simulated' && this._status !== 'reviewed') {
      throw new Error('Scenario must be calculated before selection');
    }
    this.createVersion(createdBy, 'Scenario selected as recommended');
    this._isSelected = true;
    this._status = 'selected';
    this.incrementVersion();
  }

  deselect(createdBy: string): void {
    this.createVersion(createdBy, 'Scenario deselected');
    this._isSelected = false;
    if (this._status === 'selected') {
      this._status = 'calculated';
    }
    this.incrementVersion();
  }

  approve(createdBy: string): void {
    if (this._status === 'reviewed') throw new Error('Scenario model already reviewed');
    if (!this._financialModel) {
      throw new Error('Scenario model must be calculated before review');
    }
    this.createVersion(createdBy, 'Scenario reviewed and approved');
    this._status = 'reviewed';
    this.incrementVersion();
  }

  reject(createdBy: string): void {
    if (this._status === 'rejected') throw new Error('Scenario model already rejected');
    this.createVersion(createdBy, 'Scenario rejected');
    this._status = 'rejected';
    this.incrementVersion();
  }

  archive(createdBy: string): void {
    this.createVersion(createdBy, 'Scenario archived');
    this._status = 'archived';
    this.incrementVersion();
  }

  clone(newName: string, createdBy: string): ScenarioModel {
    const cloned = ScenarioModel.create({
      tenantId: this.tenantId,
      opportunityId: this.opportunityId,
      strategyId: this.strategyId,
      name: newName,
      scenarioType: this._scenarioType,
      holdPeriodMonths: this._holdPeriodMonths,
    });
    if (this._assumptions) {
      cloned._assumptions = JSON.parse(JSON.stringify(this._assumptions));
      cloned._status = 'modeling';
      cloned._versions = [...this._versions];
    }
    return cloned;
  }

  getVersion(versionNumber: number): ScenarioVersion | null {
    return this._versions.find(v => v.version === versionNumber) ?? null;
  }

  compareVersions(v1: number, v2: number): Record<string, { old: unknown; new: unknown }> {
    const ver1 = this.getVersion(v1);
    const ver2 = this.getVersion(v2);
    if (!ver1 || !ver2) throw new Error('Version not found');

    const changes: Record<string, { old: unknown; new: unknown }> = {};
    const allKeys = new Set([
      ...Object.keys(ver1.assumptions ?? {}),
      ...Object.keys(ver2.assumptions ?? {}),
      ...Object.keys(ver1.financialModel ?? {}),
      ...Object.keys(ver2.financialModel ?? {}),
    ]);

    for (const key of allKeys) {
      const oldVal = (ver1.assumptions as any)?.[key] ?? (ver1.financialModel as any)?.[key];
      const newVal = (ver2.assumptions as any)?.[key] ?? (ver2.financialModel as any)?.[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes[key] = { old: oldVal, new: newVal };
      }
    }

    return changes;
  }
}