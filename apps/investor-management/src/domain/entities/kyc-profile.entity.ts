import { KycProfileId, KycReport, KycStatus, KycDocument, TenantId } from '@daos/shared-kernel';

export class KycProfile {
  private constructor(
    public readonly id: KycProfileId,
    public readonly tenantId: TenantId,
    public readonly investorId: string,
    private _status: KycStatus,
    private _providerRef: string | null,
    private _documents: KycDocument[],
    private _submittedAt: string | null,
    private _reviewedAt: string | null,
    private _report: KycReport | null,
  ) {}

  static create(params: {
    tenantId: TenantId;
    investorId: string;
    documents?: KycDocument[];
  }): KycProfile {
    return new KycProfile(
      KycProfileId.create(),
      params.tenantId,
      params.investorId,
      'notStarted',
      null,
      params.documents ?? [],
      null,
      null,
      null,
    );
  }

  static reconstruct(params: {
    id: KycProfileId;
    tenantId: TenantId;
    investorId: string;
    status: KycStatus;
    providerRef: string | null;
    documents: KycDocument[];
    submittedAt: string | null;
    reviewedAt: string | null;
    report: KycReport | null;
  }): KycProfile {
    return new KycProfile(
      params.id,
      params.tenantId,
      params.investorId,
      params.status,
      params.providerRef,
      params.documents,
      params.submittedAt,
      params.reviewedAt,
      params.report,
    );
  }

  get status(): KycStatus {
    return this._status;
  }

  get providerRef(): string | null {
    return this._providerRef;
  }

  get documents(): KycDocument[] {
    return [...this._documents];
  }

  get submittedAt(): string | null {
    return this._submittedAt;
  }

  get reviewedAt(): string | null {
    return this._reviewedAt;
  }

  get report(): KycReport | null {
    return this._report;
  }

  submit(providerRef: string, submittedAt: string): void {
    if (this._status !== 'notStarted' && this._status !== 'rejected') {
      throw new Error(`KYC cannot be submitted from status: ${this._status}`);
    }
    this._status = 'submitted';
    this._providerRef = providerRef;
    this._submittedAt = submittedAt;
  }

  markUnderReview(): void {
    if (this._status !== 'submitted') throw new Error(`Only submitted KYC can move to review, was: ${this._status}`);
    this._status = 'underReview';
  }

  approve(reviewedAt: string): void {
    if (this._status !== 'submitted' && this._status !== 'underReview') {
      throw new Error(`Only submitted/under-review KYC can be approved, was: ${this._status}`);
    }
    this._status = 'approved';
    this._reviewedAt = reviewedAt;
  }

  reject(reviewedAt: string): void {
    if (this._status !== 'submitted' && this._status !== 'underReview') {
      throw new Error(`Only submitted/under-review KYC can be rejected, was: ${this._status}`);
    }
    this._status = 'rejected';
    this._reviewedAt = reviewedAt;
    this._report = { passed: false, score: 0, documentResults: {}, recommendations: [] };
  }

  attachReport(report: KycReport): void {
    this._report = report;
  }
}
