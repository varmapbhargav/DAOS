import { AssetRiskAssessmentId, RiskLevel, TenantId } from '@daos/shared-kernel';

export class AssetRiskAssessment {
  private constructor(
    public readonly id: AssetRiskAssessmentId,
    public readonly tenantId: TenantId,
    public readonly caseId: string,
    private _overallScore: number,
    private _riskLevel: RiskLevel,
    private _assessedBy: string,
    private _assessedAt: string,
    private _summary: string | null,
  ) {}

  static create(params: {
    tenantId: TenantId;
    caseId: string;
    overallScore: number;
    riskLevel: RiskLevel;
    assessedBy: string;
    summary?: string | null;
  }): AssetRiskAssessment {
    return new AssetRiskAssessment(
      AssetRiskAssessmentId.create(),
      params.tenantId,
      params.caseId,
      params.overallScore,
      params.riskLevel,
      params.assessedBy,
      new Date().toISOString(),
      params.summary ?? null,
    );
  }

  static reconstruct(params: {
    id: AssetRiskAssessmentId;
    tenantId: TenantId;
    caseId: string;
    overallScore: number;
    riskLevel: RiskLevel;
    assessedBy: string;
    assessedAt: string;
    summary: string | null;
  }): AssetRiskAssessment {
    return new AssetRiskAssessment(
      params.id,
      params.tenantId,
      params.caseId,
      params.overallScore,
      params.riskLevel,
      params.assessedBy,
      params.assessedAt,
      params.summary,
    );
  }

  get overallScore(): number {
    return this._overallScore;
  }
  get riskLevel(): RiskLevel {
    return this._riskLevel;
  }
  get assessedBy(): string {
    return this._assessedBy;
  }
  get assessedAt(): string {
    return this._assessedAt;
  }
  get summary(): string | null {
    return this._summary;
  }
}