import { BlockerId, BlockerResolutionStatus, BlockerSeverity, TenantId } from '@daos/shared-kernel';

export class Blocker {
  private constructor(
    public readonly id: BlockerId,
    public readonly tenantId: TenantId,
    public readonly caseId: string,
    private _severity: BlockerSeverity,
    private _category: string,
    private _description: string,
    private _owner: string | null,
    private _dueDate: string | null,
    private _resolutionAction: string | null,
    private _evidenceReferences: string[],
    private _resolutionStatus: BlockerResolutionStatus,
    private _resolvedBy: string | null,
    private _resolvedAt: string | null,
    private _resolvedReason: string | null,
    private _raisedAt: string,
  ) {}

  static create(params: {
    tenantId: TenantId;
    caseId: string;
    severity: BlockerSeverity;
    category: string;
    description: string;
    owner?: string | null;
    dueDate?: string | null;
    resolutionAction?: string | null;
    evidenceReferences?: string[];
  }): Blocker {
    return new Blocker(
      BlockerId.create(),
      params.tenantId,
      params.caseId,
      params.severity,
      params.category,
      params.description,
      params.owner ?? null,
      params.dueDate ?? null,
      params.resolutionAction ?? null,
      params.evidenceReferences ?? [],
      'OPEN',
      null,
      null,
      null,
      new Date().toISOString(),
    );
  }

  static reconstruct(params: {
    id: BlockerId;
    tenantId: TenantId;
    caseId: string;
    severity: BlockerSeverity;
    category: string;
    description: string;
    owner: string | null;
    dueDate: string | null;
    resolutionAction: string | null;
    evidenceReferences: string[];
    resolutionStatus: BlockerResolutionStatus;
    resolvedBy: string | null;
    resolvedAt: string | null;
    resolvedReason: string | null;
    raisedAt: string;
  }): Blocker {
    return new Blocker(
      params.id,
      params.tenantId,
      params.caseId,
      params.severity,
      params.category,
      params.description,
      params.owner,
      params.dueDate,
      params.resolutionAction,
      params.evidenceReferences,
      params.resolutionStatus,
      params.resolvedBy,
      params.resolvedAt,
      params.resolvedReason,
      params.raisedAt,
    );
  }

  get severity(): BlockerSeverity {
    return this._severity;
  }
  get category(): string {
    return this._category;
  }
  get description(): string {
    return this._description;
  }
  get owner(): string | null {
    return this._owner;
  }
  get dueDate(): string | null {
    return this._dueDate;
  }
  get resolutionAction(): string | null {
    return this._resolutionAction;
  }
  get evidenceReferences(): string[] {
    return [...this._evidenceReferences];
  }
  get resolutionStatus(): BlockerResolutionStatus {
    return this._resolutionStatus;
  }
  get resolvedBy(): string | null {
    return this._resolvedBy;
  }
  get resolvedAt(): string | null {
    return this._resolvedAt;
  }
  get resolvedReason(): string | null {
    return this._resolvedReason;
  }
  get raisedAt(): string {
    return this._raisedAt;
  }

  assign(owner: string | null, dueDate: string | null, resolutionAction: string | null): void {
    this._owner = owner;
    this._dueDate = dueDate;
    this._resolutionAction = resolutionAction;
  }

  addEvidenceReference(reference: string): void {
    if (!this._evidenceReferences.includes(reference)) {
      this._evidenceReferences.push(reference);
    }
  }

  resolve(params: { status: BlockerResolutionStatus; by: string; reason?: string | null }): void {
    if (this._resolutionStatus !== 'OPEN') {
      throw new Error('Blocker is already resolved or waived');
    }
    this._resolutionStatus = params.status;
    this._resolvedBy = params.by;
    this._resolvedAt = new Date().toISOString();
    this._resolvedReason = params.reason ?? null;
  }
}