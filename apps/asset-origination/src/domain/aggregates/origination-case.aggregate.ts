import {
  AggregateRoot,
  CasePriority,
  DuplicateCheckStatus,
  InitialScreeningStatus,
  OriginationCaseId,
  OriginationCaseStatus,
  TenantId,
  UtcInstant,
} from '@daos/shared-kernel';

import { OriginationCaseCreated } from '../events/origination-case-created.event';
import { OriginationCaseStatusChanged } from '../events/origination-case-status-changed.event';

export type OriginationCaseType = {
  caseNumber: string;
  caseName: string;
  submissionType: string;
  submissionChannel: string;
  sourceId: string;
  submittedBy: string;
  relationshipManagerId: string | null;
  assignedTeamId: string | null;
  assignedAnalystId: string | null;
  assetClass: string;
  assetSubclass: string | null;
  jurisdictions: string[];
  indicativeValueMinorUnits: string | null;
  currency: string | null;
  priority: CasePriority;
  duplicateCheckStatus: DuplicateCheckStatus;
  initialScreeningStatus: InitialScreeningStatus;
  submittedAt: string | null;
  receivedAt: string | null;
};

const CASE_VALID_TRANSITIONS: Record<OriginationCaseStatus, OriginationCaseStatus[]> = {
  DRAFT: ['SUBMITTED', 'WITHDRAWN'],
  SUBMITTED: ['INTAKE', 'REJECTED', 'WITHDRAWN', 'ON_HOLD'],
  INTAKE: ['SCREENING', 'DRAFT', 'REJECTED', 'WITHDRAWN', 'ON_HOLD'],
  SCREENING: ['QUALIFICATION', 'REJECTED', 'WITHDRAWN', 'ON_HOLD'],
  QUALIFICATION: ['DUE_DILIGENCE', 'REJECTED', 'WITHDRAWN', 'ON_HOLD'],
  DUE_DILIGENCE: ['VALUATION', 'REJECTED', 'WITHDRAWN', 'ON_HOLD'],
  VALUATION: ['ASSET_RISK_REVIEW', 'REJECTED', 'WITHDRAWN', 'ON_HOLD'],
  ASSET_RISK_REVIEW: ['READY_FOR_APPROVAL', 'REJECTED', 'WITHDRAWN', 'ON_HOLD'],
  READY_FOR_APPROVAL: ['APPROVAL_IN_PROGRESS', 'REJECTED', 'WITHDRAWN', 'ON_HOLD'],
  APPROVAL_IN_PROGRESS: ['APPROVED', 'REJECTED', 'WITHDRAWN', 'ON_HOLD'],
  APPROVED: ['ENGINEERING_READY'],
  ENGINEERING_READY: [],
  REJECTED: [],
  WITHDRAWN: [],
  ON_HOLD: ['INTAKE', 'SCREENING', 'QUALIFICATION', 'DUE_DILIGENCE', 'VALUATION', 'ASSET_RISK_REVIEW', 'READY_FOR_APPROVAL', 'APPROVAL_IN_PROGRESS', 'WITHDRAWN'],
  SUPERSEDED: [],
};

export class OriginationCase extends AggregateRoot {
  private constructor(
    public readonly id: OriginationCaseId,
    public readonly tenantId: TenantId,
    private _caseNumber: string,
    private _caseName: string,
    private _submissionType: string,
    private _submissionChannel: string,
    private _sourceId: string,
    private _submittedBy: string,
    private _relationshipManagerId: string | null,
    private _assignedTeamId: string | null,
    private _assignedAnalystId: string | null,
    private _assetClass: string,
    private _assetSubclass: string | null,
    private _jurisdictions: string[],
    private _indicativeValueMinorUnits: string | null,
    private _currency: string | null,
    private _priority: CasePriority,
    private _status: OriginationCaseStatus,
    private _nextAction: string | null,
    private _nextActionDue: string | null,
    private _duplicateCheckStatus: DuplicateCheckStatus,
    private _initialScreeningStatus: InitialScreeningStatus,
    private _submittedAt: string | null,
    private _receivedAt: string | null,
  ) {
    super();
  }

  static create(params: {
    tenantId: TenantId;
    caseName: string;
    caseNumber: string;
    submissionType: string;
    submissionChannel: string;
    sourceId: string;
    submittedBy: string;
    relationshipManagerId?: string | null;
    assetClass: string;
    assetSubclass?: string | null;
    jurisdictions?: string[];
    indicativeValueMinorUnits?: string | null;
    currency?: string | null;
    priority?: CasePriority;
    receivedAt?: string | null;
  }): OriginationCase {
    const receivedAt = params.receivedAt ?? UtcInstant.now().toIso();
    const submittedAt = params.submissionType === 'MANUAL' ? UtcInstant.now().toIso() : null;
    const c = new OriginationCase(
      OriginationCaseId.create(),
      params.tenantId,
      params.caseNumber,
      params.caseName.trim(),
      params.submissionType,
      params.submissionChannel,
      params.sourceId,
      params.submittedBy,
      params.relationshipManagerId ?? null,
      null,
      null,
      params.assetClass,
      params.assetSubclass ?? null,
      params.jurisdictions ?? [],
      params.indicativeValueMinorUnits ?? null,
      params.currency ?? null,
      params.priority ?? 'MEDIUM',
      'DRAFT',
      null,
      null,
      'NOT_RUN',
      'NOT_RUN',
      submittedAt,
      receivedAt,
    );
    c.raise(new OriginationCaseCreated(c.id.value, c.tenantId.value, c._caseNumber));
    c.incrementVersion();
    return c;
  }

  static reconstruct(params: {
    id: OriginationCaseId;
    tenantId: TenantId;
    caseNumber: string;
    caseName: string;
    submissionType: string;
    submissionChannel: string;
    sourceId: string;
    submittedBy: string;
    relationshipManagerId: string | null;
    assignedTeamId: string | null;
    assignedAnalystId: string | null;
    assetClass: string;
    assetSubclass: string | null;
    jurisdictions: string[];
    indicativeValueMinorUnits: string | null;
    currency: string | null;
    priority: CasePriority;
    status: OriginationCaseStatus;
    nextAction: string | null;
    nextActionDue: string | null;
    duplicateCheckStatus: DuplicateCheckStatus;
    initialScreeningStatus: InitialScreeningStatus;
    submittedAt: string | null;
    receivedAt: string | null;
    version: number;
  }): OriginationCase {
    const c = new OriginationCase(
      params.id,
      params.tenantId,
      params.caseNumber,
      params.caseName,
      params.submissionType,
      params.submissionChannel,
      params.sourceId,
      params.submittedBy,
      params.relationshipManagerId,
      params.assignedTeamId,
      params.assignedAnalystId,
      params.assetClass,
      params.assetSubclass,
      params.jurisdictions,
      params.indicativeValueMinorUnits,
      params.currency,
      params.priority,
      params.status,
      params.nextAction,
      params.nextActionDue,
      params.duplicateCheckStatus,
      params.initialScreeningStatus,
      params.submittedAt,
      params.receivedAt,
    );
    c._version = params.version;
    return c;
  }

  get caseNumber(): string {
    return this._caseNumber;
  }
  get caseName(): string {
    return this._caseName;
  }
  get submissionType(): string {
    return this._submissionType;
  }
  get submissionChannel(): string {
    return this._submissionChannel;
  }
  get sourceId(): string {
    return this._sourceId;
  }
  get submittedBy(): string {
    return this._submittedBy;
  }
  get relationshipManagerId(): string | null {
    return this._relationshipManagerId;
  }
  get assignedTeamId(): string | null {
    return this._assignedTeamId;
  }
  get assignedAnalystId(): string | null {
    return this._assignedAnalystId;
  }
  get assetClass(): string {
    return this._assetClass;
  }
  get assetSubclass(): string | null {
    return this._assetSubclass;
  }
  get jurisdictions(): string[] {
    return [...this._jurisdictions];
  }
  get indicativeValueMinorUnits(): string | null {
    return this._indicativeValueMinorUnits;
  }
  get currency(): string | null {
    return this._currency;
  }
  get priority(): CasePriority {
    return this._priority;
  }
  get status(): OriginationCaseStatus {
    return this._status;
  }
  get nextAction(): string | null {
    return this._nextAction;
  }
  get nextActionDue(): string | null {
    return this._nextActionDue;
  }
  get duplicateCheckStatus(): DuplicateCheckStatus {
    return this._duplicateCheckStatus;
  }
  get initialScreeningStatus(): InitialScreeningStatus {
    return this._initialScreeningStatus;
  }
  get submittedAt(): string | null {
    return this._submittedAt;
  }
  get receivedAt(): string | null {
    return this._receivedAt;
  }

  private canTransitionTo(next: OriginationCaseStatus): boolean {
    return (CASE_VALID_TRANSITIONS[this._status] ?? []).includes(next);
  }

  private transitionTo(next: OriginationCaseStatus, reason: string, actor: string): void {
    if (!this.canTransitionTo(next)) {
      throw new Error(`Invalid case transition from ${this._status} to ${next}`);
    }
    const previous = this._status;
    this._status = next;
    this.raise(new OriginationCaseStatusChanged(this.id.value, this.tenantId.value, previous, next, reason, actor));
    this.incrementVersion();
  }

  submit(actor: string): void {
    if (this._submittedAt === null) {
      this._submittedAt = UtcInstant.now().toIso();
    }
    this.transitionTo('SUBMITTED', 'Case submitted', actor);
  }

  intake(actor: string): void {
    this.transitionTo('INTAKE', 'Intake completed', actor);
  }

  startScreening(actor: string): void {
    this.transitionTo('SCREENING', 'Screening started', actor);
  }

  startQualification(actor: string): void {
    this.transitionTo('QUALIFICATION', 'Qualification started', actor);
  }

  startDueDiligence(actor: string): void {
    this.transitionTo('DUE_DILIGENCE', 'Due diligence started', actor);
  }

  startValuation(actor: string): void {
    this.transitionTo('VALUATION', 'Valuation started', actor);
  }

  startRiskReview(actor: string): void {
    this.transitionTo('ASSET_RISK_REVIEW', 'Risk review started', actor);
  }

  readyForApproval(actor: string): void {
    this.transitionTo('READY_FOR_APPROVAL', 'Ready for approval', actor);
  }

  startApproval(actor: string): void {
    this.transitionTo('APPROVAL_IN_PROGRESS', 'Approval in progress', actor);
  }

  approve(actor: string): void {
    this.transitionTo('APPROVED', `Approved by ${actor}`, actor);
  }

  reject(reason: string, actor: string): void {
    if (this._status === 'APPROVED' || this._status === 'ENGINEERING_READY') {
      throw new Error('Cannot reject an approved or engineering-ready case');
    }
    this.transitionTo('REJECTED', reason, actor);
  }

  putOnHold(reason: string, actor: string): void {
    this.transitionTo('ON_HOLD', reason, actor);
  }

  resume(targetStatus: OriginationCaseStatus, actor: string): void {
    if (this._status !== 'ON_HOLD') {
      throw new Error('Only cases on hold can be resumed');
    }
    this.transitionTo(targetStatus, 'Resumed from hold', actor);
  }

  withdraw(reason: string, actor: string): void {
    if (this._status === 'APPROVED' || this._status === 'ENGINEERING_READY') {
      throw new Error('Cannot withdraw an approved or engineering-ready case');
    }
    this.transitionTo('WITHDRAWN', reason, actor);
  }

  markEngineeringReady(actor: string): void {
    this.transitionTo('ENGINEERING_READY', 'Engineering ready', actor);
  }

  assign({ teamId, analystId, actor }: { teamId: string | null; analystId: string | null; actor: string }): void {
    this._assignedTeamId = teamId;
    this._assignedAnalystId = analystId;
    this.raise(new OriginationCaseStatusChanged(this.id.value, this.tenantId.value, this._status, this._status, `Assigned by ${actor}`, actor));
    this.incrementVersion();
  }

  setNextAction(action: string | null, due: string | null): void {
    this._nextAction = action;
    this._nextActionDue = due;
    this.incrementVersion();
  }

  setDuplicateCheckStatus(status: DuplicateCheckStatus): void {
    this._duplicateCheckStatus = status;
    this.incrementVersion();
  }

  setInitialScreeningStatus(status: InitialScreeningStatus): void {
    this._initialScreeningStatus = status;
    this.incrementVersion();
  }
}
