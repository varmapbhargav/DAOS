import { DdCategory, DdFindingId, DdFindingStatus, DdSeverity, TenantId } from '@daos/shared-kernel';

export class DdFinding {
  private constructor(
    public readonly id: DdFindingId,
    public readonly tenantId: TenantId,
    public readonly ddCaseId: string,
    public readonly caseId: string,
    private _category: DdCategory,
    private _severity: DdSeverity,
    private _description: string,
    private _evidence: string[],
    private _impact: string | null,
    private _recommendation: string | null,
    private _remediation: string | null,
    private _owner: string | null,
    private _dueDate: string | null,
    private _status: DdFindingStatus,
    private _reviewer: string | null,
    private _createdAt: string,
  ) {}

  static create(params: {
    tenantId: TenantId;
    ddCaseId: string;
    caseId: string;
    category: DdCategory;
    severity: DdSeverity;
    description: string;
    evidence?: string[];
    impact?: string | null;
    recommendation?: string | null;
    remediation?: string | null;
    owner?: string | null;
    dueDate?: string | null;
    reviewer?: string | null;
  }): DdFinding {
    return new DdFinding(
      DdFindingId.create(),
      params.tenantId,
      params.ddCaseId,
      params.caseId,
      params.category,
      params.severity,
      params.description,
      params.evidence ?? [],
      params.impact ?? null,
      params.recommendation ?? null,
      params.remediation ?? null,
      params.owner ?? null,
      params.dueDate ?? null,
      'OPEN',
      params.reviewer ?? null,
      new Date().toISOString(),
    );
  }

  static reconstruct(params: {
    id: DdFindingId;
    tenantId: TenantId;
    ddCaseId: string;
    caseId: string;
    category: DdCategory;
    severity: DdSeverity;
    description: string;
    evidence: string[];
    impact: string | null;
    recommendation: string | null;
    remediation: string | null;
    owner: string | null;
    dueDate: string | null;
    status: DdFindingStatus;
    reviewer: string | null;
    createdAt: string;
  }): DdFinding {
    return new DdFinding(
      params.id,
      params.tenantId,
      params.ddCaseId,
      params.caseId,
      params.category,
      params.severity,
      params.description,
      params.evidence,
      params.impact,
      params.recommendation,
      params.remediation,
      params.owner,
      params.dueDate,
      params.status,
      params.reviewer,
      params.createdAt,
    );
  }

  get category(): DdCategory {
    return this._category;
  }
  get severity(): DdSeverity {
    return this._severity;
  }
  get description(): string {
    return this._description;
  }
  get evidence(): string[] {
    return [...this._evidence];
  }
  get impact(): string | null {
    return this._impact;
  }
  get recommendation(): string | null {
    return this._recommendation;
  }
  get remediation(): string | null {
    return this._remediation;
  }
  get owner(): string | null {
    return this._owner;
  }
  get dueDate(): string | null {
    return this._dueDate;
  }
  get status(): DdFindingStatus {
    return this._status;
  }
  get reviewer(): string | null {
    return this._reviewer;
  }
  get createdAt(): string {
    return this._createdAt;
  }

  assign(owner: string | null, dueDate: string | null): void {
    this._owner = owner;
    this._dueDate = dueDate;
  }

  addEvidence(reference: string): void {
    if (!this._evidence.includes(reference)) {
      this._evidence.push(reference);
    }
  }

  updateStatus(status: DdFindingStatus, reviewer: string | null): void {
    this._status = status;
    if (reviewer) this._reviewer = reviewer;
  }

  updateRemediation(remediation: string): void {
    this._remediation = remediation;
  }
}