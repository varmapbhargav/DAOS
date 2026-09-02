import { RiskCategory, RiskImpact, RiskItemId, RiskItemStatus, RiskProbability, TenantId } from '@daos/shared-kernel';

export class RiskItem {
  private constructor(
    public readonly id: RiskItemId,
    public readonly tenantId: TenantId,
    public readonly assessmentId: string,
    public readonly caseId: string,
    private _category: RiskCategory,
    private _description: string,
    private _probability: RiskProbability,
    private _impact: RiskImpact,
    private _score: number,
    private _mitigation: string | null,
    private _owner: string | null,
    private _dueDate: string | null,
    private _evidence: string[],
    private _status: RiskItemStatus,
    private _createdAt: string,
  ) {}

  static create(params: {
    tenantId: TenantId;
    assessmentId: string;
    caseId: string;
    category: RiskCategory;
    description: string;
    probability: RiskProbability;
    impact: RiskImpact;
    score: number;
    mitigation?: string | null;
    owner?: string | null;
    dueDate?: string | null;
    evidence?: string[];
  }): RiskItem {
    return new RiskItem(
      RiskItemId.create(),
      params.tenantId,
      params.assessmentId,
      params.caseId,
      params.category,
      params.description,
      params.probability,
      params.impact,
      params.score,
      params.mitigation ?? null,
      params.owner ?? null,
      params.dueDate ?? null,
      params.evidence ?? [],
      'OPEN',
      new Date().toISOString(),
    );
  }

  static reconstruct(params: {
    id: RiskItemId;
    tenantId: TenantId;
    assessmentId: string;
    caseId: string;
    category: RiskCategory;
    description: string;
    probability: RiskProbability;
    impact: RiskImpact;
    score: number;
    mitigation: string | null;
    owner: string | null;
    dueDate: string | null;
    evidence: string[];
    status: RiskItemStatus;
    createdAt: string;
  }): RiskItem {
    return new RiskItem(
      params.id,
      params.tenantId,
      params.assessmentId,
      params.caseId,
      params.category,
      params.description,
      params.probability,
      params.impact,
      params.score,
      params.mitigation,
      params.owner,
      params.dueDate,
      params.evidence,
      params.status,
      params.createdAt,
    );
  }

  get category(): RiskCategory {
    return this._category;
  }
  get description(): string {
    return this._description;
  }
  get probability(): RiskProbability {
    return this._probability;
  }
  get impact(): RiskImpact {
    return this._impact;
  }
  get score(): number {
    return this._score;
  }
  get mitigation(): string | null {
    return this._mitigation;
  }
  get owner(): string | null {
    return this._owner;
  }
  get dueDate(): string | null {
    return this._dueDate;
  }
  get evidence(): string[] {
    return [...this._evidence];
  }
  get status(): RiskItemStatus {
    return this._status;
  }
  get createdAt(): string {
    return this._createdAt;
  }

  update(params: { mitigation?: string | null; owner?: string | null; dueDate?: string | null; status?: RiskItemStatus }): void {
    if (params.mitigation !== undefined) this._mitigation = params.mitigation;
    if (params.owner !== undefined) this._owner = params.owner;
    if (params.dueDate !== undefined) this._dueDate = params.dueDate;
    if (params.status !== undefined) this._status = params.status;
  }

  addEvidence(reference: string): void {
    if (!this._evidence.includes(reference)) {
      this._evidence.push(reference);
    }
  }
}