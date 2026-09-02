import { DueDiligenceCaseId, DueDiligenceStatus, TenantId } from '@daos/shared-kernel';

export class DueDiligenceCase {
  private constructor(
    public readonly id: DueDiligenceCaseId,
    public readonly tenantId: TenantId,
    public readonly caseId: string,
    private _status: DueDiligenceStatus,
    private _checklist: string[],
    private _reviewers: string[],
    private _dueDate: string | null,
    private _startedAt: string,
    private _completedAt: string | null,
    private _summary: string | null,
  ) {}

  static create(params: {
    tenantId: TenantId;
    caseId: string;
    reviewers?: string[];
    dueDate?: string | null;
  }): DueDiligenceCase {
    return new DueDiligenceCase(
      DueDiligenceCaseId.create(),
      params.tenantId,
      params.caseId,
      'IN_PROGRESS',
      [],
      params.reviewers ?? [],
      params.dueDate ?? null,
      new Date().toISOString(),
      null,
      null,
    );
  }

  static reconstruct(params: {
    id: DueDiligenceCaseId;
    tenantId: TenantId;
    caseId: string;
    status: DueDiligenceStatus;
    checklist: string[];
    reviewers: string[];
    dueDate: string | null;
    startedAt: string;
    completedAt: string | null;
    summary: string | null;
  }): DueDiligenceCase {
    return new DueDiligenceCase(
      params.id,
      params.tenantId,
      params.caseId,
      params.status,
      params.checklist,
      params.reviewers,
      params.dueDate,
      params.startedAt,
      params.completedAt,
      params.summary,
    );
  }

  get status(): DueDiligenceStatus {
    return this._status;
  }
  get checklist(): string[] {
    return [...this._checklist];
  }
  get reviewers(): string[] {
    return [...this._reviewers];
  }
  get dueDate(): string | null {
    return this._dueDate;
  }
  get startedAt(): string {
    return this._startedAt;
  }
  get completedAt(): string | null {
    return this._completedAt;
  }
  get summary(): string | null {
    return this._summary;
  }

  addChecklistItem(item: string): void {
    if (!this._checklist.includes(item)) {
      this._checklist.push(item);
    }
  }

  assignReviewer(reviewer: string): void {
    if (!this._reviewers.includes(reviewer)) {
      this._reviewers.push(reviewer);
    }
  }

  complete(summary: string | null): void {
    if (this._status === 'COMPLETED') {
      throw new Error('Due diligence case is already completed');
    }
    this._status = 'COMPLETED';
    this._completedAt = new Date().toISOString();
    this._summary = summary;
  }
}