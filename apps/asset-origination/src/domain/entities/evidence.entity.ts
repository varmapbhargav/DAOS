import { EvidenceId, EvidenceType, EvidenceVerificationStatus, TenantId } from '@daos/shared-kernel';

export class Evidence {
  private constructor(
    public readonly id: EvidenceId,
    public readonly tenantId: TenantId,
    public readonly assetId: string | null,
    public readonly caseId: string | null,
    private _evidenceType: EvidenceType,
    private _source: string,
    private _sourceReference: string | null,
    private _evidenceDate: string | null,
    private _collectedAt: string,
    private _collectedBy: string,
    private _confidence: number | null,
    private _verificationStatus: EvidenceVerificationStatus,
    private _documentId: string | null,
    private _externalReference: string | null,
    private _hash: string | null,
    private _signature: string | null,
    private _expiry: string | null,
    private _accessPolicy: string | null,
  ) {}

  static create(params: {
    tenantId: TenantId;
    assetId?: string | null;
    caseId?: string | null;
    evidenceType: EvidenceType;
    source: string;
    sourceReference?: string | null;
    evidenceDate?: string | null;
    collectedBy: string;
    confidence?: number | null;
    documentId?: string | null;
    externalReference?: string | null;
    hash?: string | null;
    signature?: string | null;
    expiry?: string | null;
    accessPolicy?: string | null;
  }): Evidence {
    if (params.confidence !== undefined && params.confidence !== null && (params.confidence < 0 || params.confidence > 100)) {
      throw new Error('Confidence must be between 0 and 100');
    }
    return new Evidence(
      EvidenceId.create(),
      params.tenantId,
      params.assetId ?? null,
      params.caseId ?? null,
      params.evidenceType,
      params.source,
      params.sourceReference ?? null,
      params.evidenceDate ?? null,
      new Date().toISOString(),
      params.collectedBy,
      params.confidence ?? null,
      'UNVERIFIED',
      params.documentId ?? null,
      params.externalReference ?? null,
      params.hash ?? null,
      params.signature ?? null,
      params.expiry ?? null,
      params.accessPolicy ?? null,
    );
  }

  static reconstruct(params: {
    id: EvidenceId;
    tenantId: TenantId;
    assetId: string | null;
    caseId: string | null;
    evidenceType: EvidenceType;
    source: string;
    sourceReference: string | null;
    evidenceDate: string | null;
    collectedAt: string;
    collectedBy: string;
    confidence: number | null;
    verificationStatus: EvidenceVerificationStatus;
    documentId: string | null;
    externalReference: string | null;
    hash: string | null;
    signature: string | null;
    expiry: string | null;
    accessPolicy: string | null;
  }): Evidence {
    return new Evidence(
      params.id,
      params.tenantId,
      params.assetId,
      params.caseId,
      params.evidenceType,
      params.source,
      params.sourceReference,
      params.evidenceDate,
      params.collectedAt,
      params.collectedBy,
      params.confidence,
      params.verificationStatus,
      params.documentId,
      params.externalReference,
      params.hash,
      params.signature,
      params.expiry,
      params.accessPolicy,
    );
  }

  get evidenceType(): EvidenceType {
    return this._evidenceType;
  }
  get source(): string {
    return this._source;
  }
  get sourceReference(): string | null {
    return this._sourceReference;
  }
  get evidenceDate(): string | null {
    return this._evidenceDate;
  }
  get collectedAt(): string {
    return this._collectedAt;
  }
  get collectedBy(): string {
    return this._collectedBy;
  }
  get confidence(): number | null {
    return this._confidence;
  }
  get verificationStatus(): EvidenceVerificationStatus {
    return this._verificationStatus;
  }
  get documentId(): string | null {
    return this._documentId;
  }
  get externalReference(): string | null {
    return this._externalReference;
  }
  get hash(): string | null {
    return this._hash;
  }
  get signature(): string | null {
    return this._signature;
  }
  get expiry(): string | null {
    return this._expiry;
  }
  get accessPolicy(): string | null {
    return this._accessPolicy;
  }

  verify(): void {
    this._verificationStatus = 'VERIFIED';
  }

  reject(): void {
    this._verificationStatus = 'REJECTED';
  }

  setConfidence(confidence: number): void {
    if (confidence < 0 || confidence > 100) {
      throw new Error('Confidence must be between 0 and 100');
    }
    this._confidence = confidence;
  }

  expire(): void {
    this._verificationStatus = 'EXPIRED';
  }
}
