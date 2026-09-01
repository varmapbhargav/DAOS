import {
  ScreeningCriterionOutcome,
  ScreeningId,
  ScreeningResultStatus,
  TenantId,
} from '@daos/shared-kernel';

export class ScreeningResult {
  private constructor(
    public readonly id: ScreeningId,
    public readonly tenantId: TenantId,
    public readonly caseId: string,
    private _decision: ScreeningResultStatus,
    private _score: number,
    private _maxScore: number,
    private _criteria: ScreeningCriterionOutcome[],
    private _comments: string | null,
    private _reviewer: string,
    private _reviewedAt: string,
    private _overrideBy: string | null,
    private _overrideReason: string | null,
  ) {}

  static create(params: {
    tenantId: TenantId;
    caseId: string;
    decision: ScreeningResultStatus;
    score: number;
    maxScore: number;
    criteria?: ScreeningCriterionOutcome[];
    comments?: string | null;
    reviewer: string;
  }): ScreeningResult {
    return new ScreeningResult(
      ScreeningId.create(),
      params.tenantId,
      params.caseId,
      params.decision,
      params.score,
      params.maxScore,
      params.criteria ?? [],
      params.comments ?? null,
      params.reviewer,
      new Date().toISOString(),
      null,
      null,
    );
  }

  static reconstruct(params: {
    id: ScreeningId;
    tenantId: TenantId;
    caseId: string;
    decision: ScreeningResultStatus;
    score: number;
    maxScore: number;
    criteria: ScreeningCriterionOutcome[];
    comments: string | null;
    reviewer: string;
    reviewedAt: string;
    overrideBy: string | null;
    overrideReason: string | null;
  }): ScreeningResult {
    return new ScreeningResult(
      params.id,
      params.tenantId,
      params.caseId,
      params.decision,
      params.score,
      params.maxScore,
      params.criteria,
      params.comments,
      params.reviewer,
      params.reviewedAt,
      params.overrideBy,
      params.overrideReason,
    );
  }

  get decision(): ScreeningResultStatus {
    return this._decision;
  }
  get score(): number {
    return this._score;
  }
  get maxScore(): number {
    return this._maxScore;
  }
  get criteria(): ScreeningCriterionOutcome[] {
    return [...this._criteria];
  }
  get comments(): string | null {
    return this._comments;
  }
  get reviewer(): string {
    return this._reviewer;
  }
  get reviewedAt(): string {
    return this._reviewedAt;
  }
  get overrideBy(): string | null {
    return this._overrideBy;
  }
  get overrideReason(): string | null {
    return this._overrideReason;
  }

  override(decision: ScreeningResultStatus, by: string, reason: string): void {
    this._decision = decision;
    this._overrideBy = by;
    this._overrideReason = reason;
  }

  addCriterion(criterion: ScreeningCriterionOutcome): void {
    this._criteria.push(criterion);
  }
}
