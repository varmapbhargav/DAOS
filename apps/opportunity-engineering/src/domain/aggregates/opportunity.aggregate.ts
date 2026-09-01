import {
  AggregateRoot,
  OpportunityId,
  OpportunityScore,
  OpportunityStatus,
  SensitivityFactor,
  TargetReturnProfile,
  TenantId,
  ScenarioStatus,
  EngineeringStatus,
} from '@daos/shared-kernel';

import { OpportunityApproved } from '../events/opportunity-approved.event';
import { OpportunityEngineered } from '../events/opportunity-engineered.event';
import { OpportunityRejected } from '../events/opportunity-rejected.event';
import { ScenarioApproved } from '../events/scenario-approved.event';
import { StructureOptimized } from '../events/structure-optimized.event';
import { ReadinessEngine, ReadinessResult } from '../services/readiness-engine';
import { ScenarioModel } from '../aggregates/scenario-model.aggregate';

export type OpportunityStatusType =
  | 'draft'
  | 'engineering'
  | 'thesis_defined'
  | 'strategy_design'
  | 'financial_modeling'
  | 'scenario_modeling'
  | 'analysis'
  | 'optimization'
  | 'recommended'
  | 'ready_for_review'
  | 'under_review'
  | 'ready_for_approval'
  | 'approved'
  | 'structuring_ready'
  | 'handed_off'
  | 'on_hold'
  | 'rejected'
  | 'archived'
  | 'superseded';

export type SubWorkflowStatus = {
  engineering: EngineeringStatus;
  scenario: ScenarioStatus;
  financialModel: 'not_started' | 'building' | 'validated' | 'calculated';
  risk: 'not_started' | 'assessing' | 'assessed';
  optimization: 'not_started' | 'running' | 'completed';
  review: 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'changes_requested';
  approval: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  handoff: 'not_ready' | 'ready' | 'handed_off';
};

export type EngineeringReadiness = {
  assetReady: boolean;
  thesisReady: boolean;
  strategyReady: boolean;
  financialModelReady: boolean;
  valuationReady: boolean;
  scenariosReady: boolean;
  sensitivityReady: boolean;
  monteCarloReady: boolean;
  riskReady: boolean;
  capitalReady: boolean;
  optimizationReady: boolean;
  recommendationReady: boolean;
  overall: 'ready' | 'not_ready' | 'warning';
};

export class Opportunity extends AggregateRoot {
private constructor(
    public readonly id: OpportunityId,
    public readonly tenantId: TenantId,
    public readonly assetId: string,
    private _name: string,
    private _description: string | null,
    private _sponsorId: string,
    private _status: OpportunityStatusType,
    private _subStatus: SubWorkflowStatus,
    private _targetReturn: TargetReturnProfile | null,
    private _score: OpportunityScore | null,
    private _sensitivityFactors: SensitivityFactor[],
    private _scenarioModelIds: string[],
    private _selectedScenarioId: string | null,
    private _approvedBy: string | null,
    private _rejectionReason: string | null,
    private _readiness: EngineeringReadiness,
  ) {
    super();
  }

  static engineer(params: {
    tenantId: TenantId;
    assetId: string;
    name: string;
    description?: string;
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
      params.description?.trim() ?? null,
      params.sponsorId,
      'draft',
      {
        engineering: 'draft',
        scenario: 'not_started',
        financialModel: 'not_started',
        risk: 'not_started',
        optimization: 'not_started',
        review: 'not_submitted',
        approval: 'not_submitted',
        handoff: 'not_ready',
      },
      params.targetReturn ?? null,
      null,
      params.sensitivityFactors ?? [],
      [],
      null,
      null,
      null,
      {
        assetReady: false,
        thesisReady: false,
        strategyReady: false,
        financialModelReady: false,
        valuationReady: false,
        scenariosReady: false,
        sensitivityReady: false,
        monteCarloReady: false,
        riskReady: false,
        capitalReady: false,
        optimizationReady: false,
        recommendationReady: false,
        overall: 'not_ready',
      },
    );
    opp.raise(new OpportunityEngineered(opp.id.value, opp.tenantId.value, opp.assetId));
    return opp;
  }

  static reconstruct(params: {
    id: OpportunityId;
    tenantId: TenantId;
    assetId: string;
    name: string;
    description: string | null;
    sponsorId: string;
    status: OpportunityStatusType;
    subStatus: SubWorkflowStatus;
    targetReturn: TargetReturnProfile | null;
    score: OpportunityScore | null;
    sensitivityFactors: SensitivityFactor[];
    scenarioModelIds: string[];
    selectedScenarioId: string | null;
    approvedBy: string | null;
    rejectionReason: string | null;
    readiness: EngineeringReadiness;
  }): Opportunity {
    const opp = new Opportunity(
      params.id,
      params.tenantId,
      params.assetId,
      params.name,
      params.description,
      params.sponsorId,
      params.status,
      params.subStatus,
      params.targetReturn,
      params.score,
      params.sensitivityFactors,
      params.scenarioModelIds,
      params.selectedScenarioId,
      params.approvedBy,
      params.rejectionReason,
      params.readiness,
    );
    opp._version = 1; // Will be set by repository
    return opp;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get sponsorId(): string {
    return this._sponsorId;
  }

  get status(): OpportunityStatusType {
    return this._status;
  }

  get subStatus(): SubWorkflowStatus {
    return { ...this._subStatus };
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

  get selectedScenarioId(): string | null {
    return this._selectedScenarioId;
  }

  get approvedBy(): string | null {
    return this._approvedBy;
  }

  get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  get readiness(): EngineeringReadiness {
    return { ...this._readiness };
  }

  

  updateDescription(description: string): void {
    this._description = description.trim();
    this.incrementVersion();
  }

  startEngineering(): void {
    if (this._status !== 'draft') {
      throw new Error('Can only start engineering from draft status');
    }
    this._status = 'engineering';
    this._subStatus.engineering = 'in_progress';
    this.incrementVersion();
  }

  completeThesis(): void {
    if (this._status !== 'engineering' && this._status !== 'thesis_defined') {
      throw new Error('Thesis can only be completed during engineering phase');
    }
    this._status = 'thesis_defined';
    this._subStatus.engineering = 'complete';
    this._readiness.thesisReady = true;
    this.incrementVersion();
  }

  startStrategyDesign(): void {
    if (this._status !== 'thesis_defined') {
      throw new Error('Strategy design can only start after thesis is defined');
    }
    this._status = 'strategy_design';
    this.incrementVersion();
  }

  completeStrategyDesign(): void {
    if (this._status !== 'strategy_design') {
      throw new Error('Can only complete strategy design from strategy_design status');
    }
    this._status = 'financial_modeling';
    this._readiness.strategyReady = true;
    this.incrementVersion();
  }

  startFinancialModeling(): void {
    if (this._status !== 'financial_modeling') {
      throw new Error('Financial modeling can only start from financial_modeling status');
    }
    this._subStatus.financialModel = 'building';
    this.incrementVersion();
  }

  completeFinancialModel(): void {
    if (this._status !== 'financial_modeling') {
      throw new Error('Can only complete financial model from financial_modeling status');
    }
    this._status = 'scenario_modeling';
    this._subStatus.financialModel = 'calculated';
    this._readiness.financialModelReady = true;
    this._readiness.valuationReady = true;
    this.incrementVersion();
  }

  addScenario(scenarioModelId: string): void {
    if (this._status === 'rejected' || this._status === 'archived' || this._status === 'superseded') {
      throw new Error('Cannot add scenarios to terminal opportunities');
    }
    if (this._selectedScenarioId === scenarioModelId) {
      throw new Error('Scenario already attached');
    }
    this._scenarioModelIds.push(scenarioModelId);
    this._subStatus.scenario = 'modeling';
    this.incrementVersion();
  }

  startScenarioModeling(): void {
    if (this._status !== 'scenario_modeling') {
      throw new Error('Scenario modeling can only start from scenario_modeling status');
    }
    this.incrementVersion();
  }

  completeScenarioModeling(): void {
    if (this._status !== 'scenario_modeling') {
      throw new Error('Can only complete scenario modeling from scenario_modeling status');
    }
    this._status = 'analysis';
    this._subStatus.scenario = 'calculated';
    this._readiness.scenariosReady = true;
    this.incrementVersion();
  }

  startAnalysis(): void {
    if (this._status !== 'analysis') {
      throw new Error('Analysis can only start from analysis status');
    }
    this.incrementVersion();
  }

  completeSensitivityAnalysis(): void {
    this._readiness.sensitivityReady = true;
    this.incrementVersion();
  }

  completeMonteCarlo(): void {
    this._readiness.monteCarloReady = true;
    this.incrementVersion();
  }

  completeRiskAnalysis(): void {
    this._readiness.riskReady = true;
    this._subStatus.risk = 'assessed';
    this.incrementVersion();
  }

  startOptimization(): void {
    if (this._status !== 'analysis') {
      throw new Error('Optimization can only start from analysis status');
    }
    this._status = 'optimization';
    this._subStatus.optimization = 'running';
    this.incrementVersion();
  }

  completeOptimization(): void {
    if (this._status !== 'optimization') {
      throw new Error('Can only complete optimization from optimization status');
    }
    this._status = 'recommended';
    this._subStatus.optimization = 'completed';
    this._readiness.optimizationReady = true;
    this._readiness.recommendationReady = true;
    this.incrementVersion();
  }

  selectScenario(scenarioModelId: string): void {
    if (!this._scenarioModelIds.includes(scenarioModelId)) {
      throw new Error(`Scenario not attached to opportunity: ${scenarioModelId}`);
    }
    this._selectedScenarioId = scenarioModelId;
    this._subStatus.scenario = 'selected';
    this.incrementVersion();
  }

  generateRecommendation(): void {
    if (!this._selectedScenarioId) {
      throw new Error('Must select a scenario before generating recommendation');
    }
    if (this._status !== 'recommended') {
      throw new Error('Recommendation can only be generated from recommended status');
    }
    this.incrementVersion();
  }

  submitForReview(scenarios: ScenarioModel[]): void {
    if (this._status !== 'recommended') {
      throw new Error('Can only submit for review from recommended status');
    }
    const readiness = new ReadinessEngine().check(this, scenarios);
    if (readiness.overall !== 'ready') {
      const errors = readiness.errors.join('; ');
      throw new Error(`Opportunity is not ready for review: ${errors}`);
    }
    this._status = 'ready_for_review';
    this._subStatus.review = 'pending';
    this._readiness = readiness.checks.reduce((acc, check) => {
      const key = check.name.toLowerCase().replace(' ', '') + 'Ready' as keyof EngineeringReadiness;
      if (key in acc) {
        (acc as any)[key] = check.passed;
      }
      return acc;
    }, this._readiness);
    this._readiness.overall = readiness.overall;
    this.incrementVersion();
  }

  getReadiness(scenarios: ScenarioModel[]): ReadinessResult {
    return new ReadinessEngine().check(this, scenarios);
  }

  requestChanges(reason: string): void {
    if (this._subStatus.review !== 'pending') {
      throw new Error('Can only request changes when under review');
    }
    this._status = 'under_review';
    this._subStatus.review = 'changes_requested';
    this.incrementVersion();
  }

  approveReview(): void {
    if (this._subStatus.review !== 'pending') {
      throw new Error('Can only approve review when pending');
    }
    this._status = 'ready_for_approval';
    this._subStatus.review = 'approved';
    this._subStatus.approval = 'pending';
    this.incrementVersion();
  }

  submitForApproval(): void {
    if (this._status !== 'ready_for_approval') {
      throw new Error('Can only submit for approval from ready_for_approval status');
    }
    this._subStatus.approval = 'pending';
    this.incrementVersion();
  }

  approve(approvedBy: string): void {
    if (this._status === 'rejected') throw new Error('Rejected opportunities cannot be approved');
    if (this._status === 'approved') throw new Error('Opportunity already approved');
    if (!this._score) {
      throw new Error('Opportunity cannot be approved before it has been scored');
    }
    if (!this._selectedScenarioId) {
      throw new Error('Opportunity cannot be approved without a selected scenario');
    }
    const readiness = this.getReadiness([]);
    if (readiness.overall !== 'ready') {
      throw new Error('Opportunity must pass readiness checks before approval');
    }
    this._status = 'approved';
    this._approvedBy = approvedBy;
    this._subStatus.approval = 'approved';
    this.raise(new OpportunityApproved(this.id.value, this.tenantId.value, approvedBy));
    this.incrementVersion();
  }

  reject(reason: string): void {
    if (this._status === 'approved') throw new Error('Approved opportunities cannot be rejected');
    if (this._status === 'rejected') throw new Error('Opportunity already rejected');
    this._status = 'rejected';
    this._rejectionReason = reason;
    this._subStatus.approval = 'rejected';
    this.raise(new OpportunityRejected(this.id.value, this.tenantId.value, reason));
    this.incrementVersion();
  }

  hold(): void {
    if (this._status === 'approved' || this._status === 'rejected') {
      throw new Error('Cannot hold approved or rejected opportunities');
    }
    this._status = 'on_hold';
    this.incrementVersion();
  }

  resume(): void {
    if (this._status !== 'on_hold') {
      throw new Error('Can only resume from on_hold status');
    }
    this._status = 'engineering';
    this.incrementVersion();
  }

  handoffToDealStudio(): void {
    if (this._status !== 'approved') {
      throw new Error('Can only handoff approved opportunities');
    }
    this._status = 'structuring_ready';
    this._subStatus.handoff = 'ready';
    this.incrementVersion();
  }

  completeHandoff(): void {
    if (this._status !== 'structuring_ready') {
      throw new Error('Can only complete handoff from structuring_ready status');
    }
    this._status = 'handed_off';
    this._subStatus.handoff = 'handed_off';
    this.incrementVersion();
  }

  archive(): void {
    if (this._status === 'handed_off') {
      this._status = 'archived';
      this.incrementVersion();
    }
  }

  supersede(newOpportunityId: string): void {
    this._status = 'superseded';
    this.incrementVersion();
  }

  scoreOpportunity(score: OpportunityScore): void {
    if (this._status === 'rejected' || this._status === 'archived' || this._status === 'superseded') {
      throw new Error('Cannot score terminal opportunities');
    }
    this._score = score;
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