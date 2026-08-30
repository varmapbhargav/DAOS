import {
  AggregateRoot,
  ScenarioModelId,
  ScenarioType,
  TenantId,
} from '@daos/shared-kernel';

export class ScenarioModel extends AggregateRoot {
  private constructor(
    public readonly id: ScenarioModelId,
    public readonly tenantId: TenantId,
    public readonly opportunityId: string,
    private _name: string,
    private _scenarioType: ScenarioType,
    private _status: 'draft' | 'approved',
    private _keyAssumptions: Record<string, number>,
    private _projectedIrrPercent: number | null,
    private _projectedMultiple: number | null,
  ) {
    super();
  }

  static create(params: {
    tenantId: TenantId;
    opportunityId: string;
    name: string;
    scenarioType: ScenarioType;
    keyAssumptions?: Record<string, number>;
  }): ScenarioModel {
    const model = new ScenarioModel(
      ScenarioModelId.create(),
      params.tenantId,
      params.opportunityId,
      params.name,
      params.scenarioType,
      'draft',
      params.keyAssumptions ?? {},
      null,
      null,
    );
    model.incrementVersion();
    return model;
  }

  static reconstruct(params: {
    id: ScenarioModelId;
    tenantId: TenantId;
    opportunityId: string;
    name: string;
    scenarioType: ScenarioType;
    status: 'draft' | 'approved';
    keyAssumptions: Record<string, number>;
    projectedIrrPercent: number | null;
    projectedMultiple: number | null;
    version: number;
  }): ScenarioModel {
    const model = new ScenarioModel(
      params.id,
      params.tenantId,
      params.opportunityId,
      params.name,
      params.scenarioType,
      params.status,
      params.keyAssumptions,
      params.projectedIrrPercent,
      params.projectedMultiple,
    );
    model._version = params.version;
    return model;
  }

  get name(): string {
    return this._name;
  }

  get scenarioType(): ScenarioType {
    return this._scenarioType;
  }

  get status(): 'draft' | 'approved' {
    return this._status;
  }

  get keyAssumptions(): Record<string, number> {
    return { ...this._keyAssumptions };
  }

  get projectedIrrPercent(): number | null {
    return this._projectedIrrPercent;
  }

  get projectedMultiple(): number | null {
    return this._projectedMultiple;
  }

  applyProjection(irrPercent: number, multiple: number): void {
    this._projectedIrrPercent = irrPercent;
    this._projectedMultiple = multiple;
    this.incrementVersion();
  }

  approve(): void {
    if (this._status === 'approved') throw new Error('Scenario model already approved');
    if (this._projectedIrrPercent === null) {
      throw new Error('Scenario model must be projected before approval');
    }
    this._status = 'approved';
    this.incrementVersion();
  }
}
