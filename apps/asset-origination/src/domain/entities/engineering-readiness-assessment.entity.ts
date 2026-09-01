import { EngineeringReadinessId, EngineeringReadinessStatus, TenantId } from '@daos/shared-kernel';

export class EngineeringReadinessAssessment {
  private constructor(
    public readonly id: EngineeringReadinessId,
    public readonly tenantId: TenantId,
    public readonly caseId: string,
    public readonly assetId: string,
    private _status: EngineeringReadinessStatus,
    private _checks: Map<string, { passed: boolean; notes: string | null }>,
    private _assessedBy: string,
    private _assessedAt: string,
    private _summary: string | null,
  ) {}

  static create(params: {
    tenantId: TenantId;
    caseId: string;
    assetId: string;
    assessedBy: string;
  }): EngineeringReadinessAssessment {
    const checks = new Map<string, { passed: boolean; notes: string | null }>([
      ['ASSET_IDENTITY', { passed: false, notes: null }],
      ['OWNERSHIP', { passed: false, notes: null }],
      ['BENEFICIAL_OWNERSHIP', { passed: false, notes: null }],
      ['LEGAL_RIGHTS', { passed: false, notes: null }],
      ['TRANSFERABILITY', { passed: false, notes: null }],
      ['PROVENANCE', { passed: false, notes: null }],
      ['EVIDENCE', { passed: false, notes: null }],
      ['COUNTERPARTIES', { passed: false, notes: null }],
      ['COMPLIANCE', { passed: false, notes: null }],
      ['DD', { passed: false, notes: null }],
      ['VALUATION', { passed: false, notes: null }],
      ['ASSET_RISK', { passed: false, notes: null }],
      ['DATA_COMPLETENESS', { passed: false, notes: null }],
      ['CRITICAL_BLOCKERS', { passed: false, notes: null }],
      ['HIGH_BLOCKERS', { passed: false, notes: null }],
      ['OPEN_EXCEPTIONS', { passed: false, notes: null }],
    ]);
    return new EngineeringReadinessAssessment(
      EngineeringReadinessId.create(),
      params.tenantId,
      params.caseId,
      params.assetId,
      'NOT_READY',
      checks,
      params.assessedBy,
      new Date().toISOString(),
      null,
    );
  }

  static reconstruct(params: {
    id: EngineeringReadinessId;
    tenantId: TenantId;
    caseId: string;
    assetId: string;
    status: EngineeringReadinessStatus;
    checks: Map<string, { passed: boolean; notes: string | null }>;
    assessedBy: string;
    assessedAt: string;
    summary: string | null;
  }): EngineeringReadinessAssessment {
    return new EngineeringReadinessAssessment(
      params.id,
      params.tenantId,
      params.caseId,
      params.assetId,
      params.status,
      params.checks,
      params.assessedBy,
      params.assessedAt,
      params.summary,
    );
  }

  get status(): EngineeringReadinessStatus {
    return this._status;
  }
  get checks(): Map<string, { passed: boolean; notes: string | null }> {
    return new Map(this._checks);
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

  recordCheck(check: string, passed: boolean, notes?: string | null): void {
    if (!this._checks.has(check)) throw new Error(`Invalid check: ${check}`);
    this._checks.set(check, { passed, notes: notes ?? null });
    this.recalculateStatus();
  }

  private recalculateStatus(): void {
    let passed = 0;
    let failedCritical = false;
    for (const [check, result] of this._checks) {
      if (result.passed) passed++;
      if (!result.passed && (check === 'CRITICAL_BLOCKERS' || check === 'HIGH_BLOCKERS')) {
        failedCritical = true;
      }
    }
    const total = this._checks.size;
    if (failedCritical) {
      this._status = 'NOT_READY';
    } else if (passed === total) {
      this._status = 'READY';
    } else {
      this._status = 'CONDITIONALLY_READY';
    }
  }

  setSummary(summary: string | null): void {
    this._summary = summary;
  }
}