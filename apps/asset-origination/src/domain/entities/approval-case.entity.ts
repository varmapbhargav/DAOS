import { ApprovalId, ApprovalType, CaseApprovalStatus, TenantId } from '@daos/shared-kernel';

export class ApprovalCase {
  private constructor(
    public readonly id: ApprovalId,
    public readonly tenantId: TenantId,
    public readonly caseId: string,
    private _status: CaseApprovalStatus,
    private _approvalType: ApprovalType,
    private _levels: string[],
    private _currentLevel: number,
    private _thresholdAmount: number | null,
    private _requiredApprovers: Map<string, string[]>, // level -> approver IDs
    private _decisions: string[], // approval decision IDs
    private _conditions: string[],
    private _conflictOfInterestChecked: boolean,
    private _startedAt: string | null,
    private _completedAt: string | null,
    private _finalDecidedBy: string | null,
    private _finalReason: string | null,
  ) {}

  static create(params: {
    tenantId: TenantId;
    caseId: string;
    approvalType: ApprovalType;
    levels: string[];
    requiredApprovers: Map<string, string[]>;
    thresholdAmount?: number | null;
  }): ApprovalCase {
    return new ApprovalCase(
      ApprovalId.create(),
      params.tenantId,
      params.caseId,
      'PENDING',
      params.approvalType,
      params.levels,
      0,
      params.thresholdAmount ?? null,
      params.requiredApprovers,
      [],
      [],
      false,
      null,
      null,
      null,
      null,
    );
  }

  static reconstruct(params: {
    id: ApprovalId;
    tenantId: TenantId;
    caseId: string;
    status: CaseApprovalStatus;
    approvalType: ApprovalType;
    levels: string[];
    currentLevel: number;
    thresholdAmount: number | null;
    requiredApprovers: Map<string, string[]>;
    decisions: string[];
    conditions: string[];
    conflictOfInterestChecked: boolean;
    startedAt: string | null;
    completedAt: string | null;
    finalDecidedBy: string | null;
    finalReason: string | null;
  }): ApprovalCase {
    return new ApprovalCase(
      params.id,
      params.tenantId,
      params.caseId,
      params.status,
      params.approvalType,
      params.levels,
      params.currentLevel,
      params.thresholdAmount,
      params.requiredApprovers,
      params.decisions,
      params.conditions,
      params.conflictOfInterestChecked,
      params.startedAt,
      params.completedAt,
      params.finalDecidedBy,
      params.finalReason,
    );
  }

  get status(): CaseApprovalStatus {
    return this._status;
  }
  get approvalType(): ApprovalType {
    return this._approvalType;
  }
  get levels(): string[] {
    return [...this._levels];
  }
  get currentLevel(): number {
    return this._currentLevel;
  }
  get thresholdAmount(): number | null {
    return this._thresholdAmount;
  }
  get requiredApprovers(): Map<string, string[]> {
    return new Map(this._requiredApprovers);
  }
  get decisions(): string[] {
    return [...this._decisions];
  }
  get conditions(): string[] {
    return [...this._conditions];
  }
  get conflictOfInterestChecked(): boolean {
    return this._conflictOfInterestChecked;
  }
  get startedAt(): string | null {
    return this._startedAt;
  }
  get completedAt(): string | null {
    return this._completedAt;
  }
  get finalDecidedBy(): string | null {
    return this._finalDecidedBy;
  }
  get finalReason(): string | null {
    return this._finalReason;
  }

  start(): void {
    if (this._status !== 'PENDING') throw new Error('Approval case already started');
    this._status = 'IN_PROGRESS';
    this._startedAt = new Date().toISOString();
  }

  recordDecision(decisionId: string, decision: string, level: string, conditions?: string[]): void {
    if (this._status !== 'IN_PROGRESS') throw new Error('Approval case not in progress');
    this._decisions.push(decisionId);
    if (conditions && conditions.length > 0) {
      this._conditions.push(...conditions);
    }

    // Simplified: just advance based on approval type
    if (this._approvalType === 'SINGLE' || this._approvalType === 'DELEGATED') {
      this.complete(decision, null);
    } else if (this._approvalType === 'MULTI_LEVEL_SEQUENTIAL') {
      this._currentLevel++;
      if (this._currentLevel >= this._levels.length) {
        this.complete(decision, null);
      }
    } else if (this._approvalType === 'MULTI_LEVEL_PARALLEL') {
      // All levels decided - complete
      this.complete(decision, null);
    }
  }

  complete(finalDecision: string, decidedBy: string | null, reason?: string | null): void {
    this._status = finalDecision === 'APPROVE' ? 'APPROVED' : finalDecision === 'REJECT' ? 'REJECTED' : 'CONDITIONALLY_APPROVED';
    this._completedAt = new Date().toISOString();
    this._finalDecidedBy = decidedBy;
    this._finalReason = reason ?? null;
  }

  checkConflictOfInterest(checked: boolean): void {
    this._conflictOfInterestChecked = checked;
  }
}