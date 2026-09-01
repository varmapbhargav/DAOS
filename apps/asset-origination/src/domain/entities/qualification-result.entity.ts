import {
  QualificationBlocker,
  QualificationId,
  QualificationResultStatus,
  QualificationScoreBreakdown,
  TenantId,
} from '@daos/shared-kernel';

export class QualificationResult {
  private constructor(
    public readonly id: QualificationId,
    public readonly tenantId: TenantId,
    public readonly caseId: string,
    private _decision: QualificationResultStatus,
    private _score: QualificationScoreBreakdown,
    private _blockers: QualificationBlocker[],
    private _missingEvidence: string[],
    private _explanation: string | null,
    private _qualifiedBy: string,
    private _qualifiedAt: string,
  ) {}

  static create(params: {
    tenantId: TenantId;
    caseId: string;
    decision: QualificationResultStatus;
    score: QualificationScoreBreakdown;
    blockers?: QualificationBlocker[];
    missingEvidence?: string[];
    explanation?: string | null;
    qualifiedBy: string;
  }): QualificationResult {
    return new QualificationResult(
      QualificationId.create(),
      params.tenantId,
      params.caseId,
      params.decision,
      params.score,
      params.blockers ?? [],
      params.missingEvidence ?? [],
      params.explanation ?? null,
      params.qualifiedBy,
      new Date().toISOString(),
    );
  }

  static reconstruct(params: {
    id: QualificationId;
    tenantId: TenantId;
    caseId: string;
    decision: QualificationResultStatus;
    score: QualificationScoreBreakdown;
    blockers: QualificationBlocker[];
    missingEvidence: string[];
    explanation: string | null;
    qualifiedBy: string;
    qualifiedAt: string;
  }): QualificationResult {
    return new QualificationResult(
      params.id,
      params.tenantId,
      params.caseId,
      params.decision,
      params.score,
      params.blockers,
      params.missingEvidence,
      params.explanation,
      params.qualifiedBy,
      params.qualifiedAt,
    );
  }

  get decision(): QualificationResultStatus {
    return this._decision;
  }
  get score(): QualificationScoreBreakdown {
    return { ...this._score };
  }
  get blockers(): QualificationBlocker[] {
    return [...this._blockers];
  }
  get missingEvidence(): string[] {
    return [...this._missingEvidence];
  }
  get explanation(): string | null {
    return this._explanation;
  }
  get qualifiedBy(): string {
    return this._qualifiedBy;
  }
  get qualifiedAt(): string {
    return this._qualifiedAt;
  }

  addBlocker(blocker: QualificationBlocker): void {
    this._blockers.push(blocker);
  }

  addMissingEvidence(evidence: string): void {
    if (!this._missingEvidence.includes(evidence)) {
      this._missingEvidence.push(evidence);
    }
  }
}
