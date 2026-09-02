import {
  DDRating,
  DueDiligenceReportId,
  Finding,
  TenantId,
} from '@daos/shared-kernel';

export class DueDiligenceReport {
  private constructor(
    public readonly id: DueDiligenceReportId,
    public readonly tenantId: TenantId,
    public readonly assetId: string,
    private _status: 'draft' | 'inReview' | 'completed',
    private _rating: DDRating | null,
    private _findings: Finding[],
    private _completedBy: string | null,
    private _completedAt: string | null,
    private _summary: string | null,
  ) {}

  static create(params: {
    tenantId: TenantId;
    assetId: string;
    findings?: Finding[];
  }): DueDiligenceReport {
    return new DueDiligenceReport(
      DueDiligenceReportId.create(),
      params.tenantId,
      params.assetId,
      'draft',
      null,
      params.findings ?? [],
      null,
      null,
      null,
    );
  }

  static reconstruct(params: {
    id: DueDiligenceReportId;
    tenantId: TenantId;
    assetId: string;
    status: 'draft' | 'inReview' | 'completed';
    rating: DDRating | null;
    findings: Finding[];
    completedBy: string | null;
    completedAt: string | null;
    summary: string | null;
  }): DueDiligenceReport {
    return new DueDiligenceReport(
      params.id,
      params.tenantId,
      params.assetId,
      params.status,
      params.rating,
      params.findings,
      params.completedBy,
      params.completedAt,
      params.summary,
    );
  }

  get status(): 'draft' | 'inReview' | 'completed' {
    return this._status;
  }

  get rating(): DDRating | null {
    return this._rating;
  }

  get findings(): Finding[] {
    return [...this._findings];
  }

  get completedBy(): string | null {
    return this._completedBy;
  }

  get completedAt(): string | null {
    return this._completedAt;
  }

  get summary(): string | null {
    return this._summary;
  }

  addFinding(finding: Finding): void {
    this._findings.push(finding);
  }

  complete(params: { rating: DDRating; completedBy: string; completedAt: string; summary?: string }): void {
    if (this._status === 'completed') {
      throw new Error('Due diligence report is already completed');
    }
    this._status = 'completed';
    this._rating = params.rating;
    this._completedBy = params.completedBy;
    this._completedAt = params.completedAt;
    this._summary = params.summary ?? null;
  }
}
