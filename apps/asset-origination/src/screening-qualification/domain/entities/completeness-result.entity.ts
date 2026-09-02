import { CompletenessBreakdown, CompletenessId, TenantId } from '@daos/shared-kernel';

const ZERO_BREAKDOWN: CompletenessBreakdown = {
  identity: 0,
  ownership: 0,
  rights: 0,
  evidence: 0,
  legal: 0,
  counterparty: 0,
  financialData: 0,
  valuation: 0,
  dueDiligence: 0,
  risk: 0,
  compliance: 0,
  overall: 0,
};

export class CompletenessResult {
  private constructor(
    public readonly id: CompletenessId,
    public readonly tenantId: TenantId,
    public readonly caseId: string,
    private _breakdown: CompletenessBreakdown,
    private _calculatedBy: string,
    private _calculatedAt: string,
  ) {}

  static create(params: {
    tenantId: TenantId;
    caseId: string;
    breakdown: CompletenessBreakdown;
    calculatedBy: string;
  }): CompletenessResult {
    return new CompletenessResult(
      CompletenessId.create(),
      params.tenantId,
      params.caseId,
      { ...ZERO_BREAKDOWN, ...params.breakdown },
      params.calculatedBy,
      new Date().toISOString(),
    );
  }

  static reconstruct(params: {
    id: CompletenessId;
    tenantId: TenantId;
    caseId: string;
    breakdown: CompletenessBreakdown;
    calculatedBy: string;
    calculatedAt: string;
  }): CompletenessResult {
    return new CompletenessResult(
      params.id,
      params.tenantId,
      params.caseId,
      params.breakdown,
      params.calculatedBy,
      params.calculatedAt,
    );
  }

  get breakdown(): CompletenessBreakdown {
    return { ...this._breakdown };
  }
  get calculatedBy(): string {
    return this._calculatedBy;
  }
  get calculatedAt(): string {
    return this._calculatedAt;
  }
}