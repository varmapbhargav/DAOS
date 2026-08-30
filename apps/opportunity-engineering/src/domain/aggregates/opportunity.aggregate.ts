import {
  AggregateRoot,
  OpportunityId,
  OpportunityScore,
  OpportunityStatus,
  SensitivityFactor,
  TargetReturnProfile,
  TenantId,
} from '@daos/shared-kernel';

import { OpportunityApproved } from '../events/opportunity-approved.event';
import { OpportunityEngineered } from '../events/opportunity-engineered.event';
import { OpportunityRejected } from '../events/opportunity-rejected.event';
import { ScenarioApproved } from '../events/scenario-approved.event';
import { StructureOptimized } from '../events/structure-optimized.event';

export class Opportunity extends AggregateRoot {
  private constructor(
    public readonly id: OpportunityId,
    public readonly tenantId: TenantId,
    public readonly assetId: string,
    private _name: string,
    private _sponsorId: string,
    private _status: OpportunityStatus,
    private _targetReturn: TargetReturnProfile | null,
    private _score: OpportunityScore | null,
    private _sensitivityFactors: SensitivityFactor[],
    private _scenarioModelIds: string[],
    private _approvedScenarioId: string | null,
    private _approvedBy: string | null,
    private _rejectionReason: string | null,
  ) {
    super();
  }

  static engineer(params: {
    tenantId: TenantId;
    assetId: string;
    name: string;
    sponsorId: string;
    targetReturn?: TargetReturnProfile | null;
    sensitivityFactors?: SensitivityFactor[];
  }): Opportunity {
    if (!params.name.trim()) throw new Error('Opportunity name is required');
    const opp = new Opportunity(
      OpportunityId.create(),
      params.tenantId,
      params.assetId,
      params.name.trim(),
      params.sponsorId,
      'engineered',
      params.targetReturn ?? null,
      null,
      params.sensitivityFactors ?? [],
      [],
      null,
      null,
      null,
    );
    opp.raise(new OpportunityEngineered(opp.id.value, opp.tenantId.value, opp.assetId));
    opp.incrementVersion();
    return opp;
  }

  static reconstruct(params: {
    id: OpportunityId;
    tenantId: TenantId;
    assetId: string;
    name: string;
    sponsorId: string;
    status: OpportunityStatus;
    targetReturn: TargetReturnProfile | null;
    score: OpportunityScore | null;
    sensitivityFactors: SensitivityFactor[];
    scenarioModelIds: string[];
    approvedScenarioId: string | null;
    approvedBy: string | null;
    rejectionReason: string | null;
    version: number;
  }): Opportunity {
    const opp = new Opportunity(
      params.id,
      params.tenantId,
      params.assetId,
      params.name,
      params.sponsorId,
      params.status,
      params.targetReturn,
      params.score,
      params.sensitivityFactors,
      params.scenarioModelIds,
      params.approvedScenarioId,
      params.approvedBy,
      params.rejectionReason,
    );
    opp._version = params.version;
    return opp;
  }

  get name(): string {
    return this._name;
  }

  get sponsorId(): string {
    return this._sponsorId;
  }

  get status(): OpportunityStatus {
    return this._status;
  }

  get targetReturn(): TargetReturnProfile | null {
    return this._targetReturn;
  }

  get score(): OpportunityScore | null {
    return this._score;
  }

  get sensitivityFactors(): SensitivityFactor[] {
    return [...this._sensitivityFactors];
  }

  get scenarioModelIds(): string[] {
    return [...this._scenarioModelIds];
  }

  get approvedScenarioId(): string | null {
    return this._approvedScenarioId;
  }

  get approvedBy(): string | null {
    return this._approvedBy;
  }

  get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  addScenario(scenarioModelId: string): void {
    if (this._status === 'rejected') throw new Error('Rejected opportunities cannot add scenarios');
    if (this._approvedScenarioId === scenarioModelId) {
      throw new Error('Scenario already attached');
    }
    this._scenarioModelIds.push(scenarioModelId);
    this.incrementVersion();
  }

  approveScenario(scenarioModelId: string): void {
    if (!this._scenarioModelIds.includes(scenarioModelId)) {
      throw new Error(`Scenario not attached to opportunity: ${scenarioModelId}`);
    }
    this._approvedScenarioId = scenarioModelId;
    this._status = 'scenarioApproved';
    this.raise(new ScenarioApproved(this.id.value, this.tenantId.value, scenarioModelId));
    this.incrementVersion();
  }

  scoreOpportunity(score: OpportunityScore): void {
    if (this._status === 'rejected') throw new Error('Rejected opportunities cannot be scored');
    this._score = score;
    this._status = 'scored';
    this.incrementVersion();
  }

  approve(approvedBy: string): void {
    if (this._status === 'rejected') throw new Error('Rejected opportunities cannot be approved');
    if (this._status === 'approved') throw new Error('Opportunity already approved');
    if (!this._score) {
      throw new Error('Opportunity cannot be approved before it has been scored');
    }
    if (!this._approvedScenarioId) {
      throw new Error('Opportunity cannot be approved without an approved scenario');
    }
    this._status = 'approved';
    this._approvedBy = approvedBy;
    this.raise(new OpportunityApproved(this.id.value, this.tenantId.value, approvedBy));
    this.incrementVersion();
  }

  reject(reason: string): void {
    if (this._status === 'approved') throw new Error('Approved opportunities cannot be rejected');
    if (this._status === 'rejected') throw new Error('Opportunity already rejected');
    this._status = 'rejected';
    this._rejectionReason = reason;
    this.raise(new OpportunityRejected(this.id.value, this.tenantId.value, reason));
    this.incrementVersion();
  }

  optimizeStructure(scenarioModelId: string, optimizedIrrPercent: number): void {
    if (!this._scenarioModelIds.includes(scenarioModelId)) {
      throw new Error(`Scenario not attached to opportunity: ${scenarioModelId}`);
    }
    this.raise(
      new StructureOptimized(this.id.value, this.tenantId.value, scenarioModelId, optimizedIrrPercent),
    );
    this.incrementVersion();
  }
}
