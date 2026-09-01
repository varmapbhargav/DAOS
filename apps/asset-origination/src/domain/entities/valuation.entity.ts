import { TenantId, ValuationCurrency, ValuationId, ValuationMethodology, ValuationStatus } from '@daos/shared-kernel';

export class Valuation {
  private constructor(
    public readonly id: ValuationId,
    public readonly tenantId: TenantId,
    public readonly caseId: string,
    private _status: ValuationStatus,
    private _currentMarketValue: number | null,
    private _fairValue: number | null,
    private _bookValue: number | null,
    private _nav: number | null,
    private _faceValue: number | null,
    private _outstandingPrincipal: number | null,
    private _indicativeAcquisitionValue: number | null,
    private _purchasePrice: number | null,
    private _valuationDate: string | null,
    private _valuationSource: string | null,
    private _valuer: string | null,
    private _methodology: ValuationMethodology | null,
    private _confidence: number | null,
    private _currency: ValuationCurrency,
    private _reviewer: string | null,
    private _reviewedAt: string | null,
    private _approvalReason: string | null,
    private _rejectionReason: string | null,
    private _requestedAt: string,
    private _assignedAt: string | null,
    private _uploadedAt: string | null,
    private _approvedAt: string | null,
    private _rejectedAt: string | null,
  ) {}

  static create(params: {
    tenantId: TenantId;
    caseId: string;
    currency?: ValuationCurrency;
    valuer?: string | null;
  }): Valuation {
    return new Valuation(
      ValuationId.create(),
      params.tenantId,
      params.caseId,
      'REQUESTED',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      params.valuer ?? null,
      null,
      null,
      params.currency ?? 'USD',
      null,
      null,
      null,
      null,
      new Date().toISOString(),
      null,
      null,
      null,
      null,
    );
  }

  static reconstruct(params: {
    id: ValuationId;
    tenantId: TenantId;
    caseId: string;
    status: ValuationStatus;
    currentMarketValue: number | null;
    fairValue: number | null;
    bookValue: number | null;
    nav: number | null;
    faceValue: number | null;
    outstandingPrincipal: number | null;
    indicativeAcquisitionValue: number | null;
    purchasePrice: number | null;
    valuationDate: string | null;
    valuationSource: string | null;
    valuer: string | null;
    methodology: ValuationMethodology | null;
    confidence: number | null;
    currency: ValuationCurrency;
    reviewer: string | null;
    reviewedAt: string | null;
    approvalReason: string | null;
    rejectionReason: string | null;
    requestedAt: string;
    assignedAt: string | null;
    uploadedAt: string | null;
    approvedAt: string | null;
    rejectedAt: string | null;
  }): Valuation {
    return new Valuation(
      params.id,
      params.tenantId,
      params.caseId,
      params.status,
      params.currentMarketValue,
      params.fairValue,
      params.bookValue,
      params.nav,
      params.faceValue,
      params.outstandingPrincipal,
      params.indicativeAcquisitionValue,
      params.purchasePrice,
      params.valuationDate,
      params.valuationSource,
      params.valuer,
      params.methodology,
      params.confidence,
      params.currency,
      params.reviewer,
      params.reviewedAt,
      params.approvalReason,
      params.rejectionReason,
      params.requestedAt,
      params.assignedAt,
      params.uploadedAt,
      params.approvedAt,
      params.rejectedAt,
    );
  }

  get status(): ValuationStatus {
    return this._status;
  }
  get currentMarketValue(): number | null {
    return this._currentMarketValue;
  }
  get fairValue(): number | null {
    return this._fairValue;
  }
  get bookValue(): number | null {
    return this._bookValue;
  }
  get nav(): number | null {
    return this._nav;
  }
  get faceValue(): number | null {
    return this._faceValue;
  }
  get outstandingPrincipal(): number | null {
    return this._outstandingPrincipal;
  }
  get indicativeAcquisitionValue(): number | null {
    return this._indicativeAcquisitionValue;
  }
  get purchasePrice(): number | null {
    return this._purchasePrice;
  }
  get valuationDate(): string | null {
    return this._valuationDate;
  }
  get valuationSource(): string | null {
    return this._valuationSource;
  }
  get valuer(): string | null {
    return this._valuer;
  }
  get methodology(): ValuationMethodology | null {
    return this._methodology;
  }
  get confidence(): number | null {
    return this._confidence;
  }
  get currency(): ValuationCurrency {
    return this._currency;
  }
  get reviewer(): string | null {
    return this._reviewer;
  }
  get reviewedAt(): string | null {
    return this._reviewedAt;
  }
  get approvalReason(): string | null {
    return this._approvalReason;
  }
  get rejectionReason(): string | null {
    return this._rejectionReason;
  }
  get requestedAt(): string {
    return this._requestedAt;
  }
  get assignedAt(): string | null {
    return this._assignedAt;
  }
  get uploadedAt(): string | null {
    return this._uploadedAt;
  }
  get approvedAt(): string | null {
    return this._approvedAt;
  }
  get rejectedAt(): string | null {
    return this._rejectedAt;
  }

  assign(valuer: string): void {
    if (this._status !== 'REQUESTED') {
      throw new Error('Can only assign valuer to REQUESTED valuation');
    }
    this._status = 'ASSIGNED';
    this._valuer = valuer;
    this._assignedAt = new Date().toISOString();
  }

  upload(params: {
    currentMarketValue?: number | null;
    fairValue?: number | null;
    bookValue?: number | null;
    nav?: number | null;
    faceValue?: number | null;
    outstandingPrincipal?: number | null;
    indicativeAcquisitionValue?: number | null;
    purchasePrice?: number | null;
    valuationDate?: string | null;
    valuationSource?: string | null;
    methodology?: ValuationMethodology | null;
    confidence?: number | null;
    currency?: ValuationCurrency;
  }): void {
    if (this._status === 'APPROVED' || this._status === 'REJECTED') {
      throw new Error('Cannot upload to a finalized valuation');
    }
    this._status = 'UPLOADED';
    if (params.currentMarketValue !== undefined) this._currentMarketValue = params.currentMarketValue;
    if (params.fairValue !== undefined) this._fairValue = params.fairValue;
    if (params.bookValue !== undefined) this._bookValue = params.bookValue;
    if (params.nav !== undefined) this._nav = params.nav;
    if (params.faceValue !== undefined) this._faceValue = params.faceValue;
    if (params.outstandingPrincipal !== undefined) this._outstandingPrincipal = params.outstandingPrincipal;
    if (params.indicativeAcquisitionValue !== undefined)
      this._indicativeAcquisitionValue = params.indicativeAcquisitionValue;
    if (params.purchasePrice !== undefined) this._purchasePrice = params.purchasePrice;
    if (params.valuationDate !== undefined) this._valuationDate = params.valuationDate;
    if (params.valuationSource !== undefined) this._valuationSource = params.valuationSource;
    if (params.methodology !== undefined) this._methodology = params.methodology;
    if (params.confidence !== undefined) this._confidence = params.confidence;
    if (params.currency !== undefined) this._currency = params.currency;
    this._uploadedAt = new Date().toISOString();
  }

  submitForReview(): void {
    if (this._status !== 'UPLOADED') {
      throw new Error('Can only submit UPLOADED valuation for review');
    }
    this._status = 'IN_REVIEW';
  }

  approve(reviewer: string, approvalReason: string | null): void {
    if (this._status !== 'IN_REVIEW') {
      throw new Error('Can only approve IN_REVIEW valuation');
    }
    this._status = 'APPROVED';
    this._reviewer = reviewer;
    this._reviewedAt = new Date().toISOString();
    this._approvalReason = approvalReason;
    this._approvedAt = new Date().toISOString();
  }

  reject(reviewer: string, reason: string): void {
    if (this._status !== 'IN_REVIEW') {
      throw new Error('Can only reject IN_REVIEW valuation');
    }
    this._status = 'REJECTED';
    this._reviewer = reviewer;
    this._reviewedAt = new Date().toISOString();
    this._rejectionReason = reason;
    this._rejectedAt = new Date().toISOString();
  }

  revalue(): void {
    if (this._status !== 'REJECTED') {
      throw new Error('Can only revalue REJECTED valuation');
    }
    this._status = 'REQUESTED';
    this._currentMarketValue = null;
    this._fairValue = null;
    this._bookValue = null;
    this._nav = null;
    this._faceValue = null;
    this._outstandingPrincipal = null;
    this._indicativeAcquisitionValue = null;
    this._purchasePrice = null;
    this._valuationDate = null;
    this._valuationSource = null;
    this._methodology = null;
    this._confidence = null;
    this._reviewer = null;
    this._reviewedAt = null;
    this._approvalReason = null;
    this._rejectionReason = null;
    this._requestedAt = new Date().toISOString();
    this._assignedAt = null;
    this._uploadedAt = null;
    this._approvedAt = null;
    this._rejectedAt = null;
  }
}