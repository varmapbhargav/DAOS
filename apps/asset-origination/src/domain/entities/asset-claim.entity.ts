import { ClaimId, ClaimStatus, ClaimTypeRule, TenantId, VerificationMethod } from '@daos/shared-kernel';

export type ClaimMateriality = 'HIGH' | 'MEDIUM' | 'LOW';

export class AssetClaim {
  private constructor(
    public readonly id: ClaimId,
    public readonly tenantId: TenantId,
    public readonly assetId: string,
    private _claimStatement: string,
    private _claimType: ClaimTypeRule,
    private _claimOwner: string,
    private _materiality: ClaimMateriality,
    private _status: ClaimStatus,
    private _verificationMethod: VerificationMethod | null,
    private _evidenceReferences: string[],
    private _confidence: number | null,
    private _reviewer: string | null,
    private _verifiedAt: string | null,
    private _createdAt: string,
    private _rejectionReason: string | null,
  ) {}

  static create(params: {
    tenantId: TenantId;
    assetId: string;
    claimStatement: string;
    claimType: ClaimTypeRule;
    claimOwner: string;
    materiality: ClaimMateriality;
  }): AssetClaim {
    return new AssetClaim(
      ClaimId.create(),
      params.tenantId,
      params.assetId,
      params.claimStatement,
      params.claimType,
      params.claimOwner,
      params.materiality,
      'DRAFT',
      null,
      [],
      null,
      null,
      null,
      new Date().toISOString(),
      null,
    );
  }

  static reconstruct(params: {
    id: ClaimId;
    tenantId: TenantId;
    assetId: string;
    claimStatement: string;
    claimType: ClaimTypeRule;
    claimOwner: string;
    materiality: ClaimMateriality;
    status: ClaimStatus;
    verificationMethod: VerificationMethod | null;
    evidenceReferences: string[];
    confidence: number | null;
    reviewer: string | null;
    verifiedAt: string | null;
    createdAt: string;
    rejectionReason: string | null;
  }): AssetClaim {
    return new AssetClaim(
      params.id,
      params.tenantId,
      params.assetId,
      params.claimStatement,
      params.claimType,
      params.claimOwner,
      params.materiality,
      params.status,
      params.verificationMethod,
      params.evidenceReferences,
      params.confidence,
      params.reviewer,
      params.verifiedAt,
      params.createdAt,
      params.rejectionReason,
    );
  }

  get claimStatement(): string {
    return this._claimStatement;
  }
  get claimType(): ClaimTypeRule {
    return this._claimType;
  }
  get claimOwner(): string {
    return this._claimOwner;
  }
  get materiality(): ClaimMateriality {
    return this._materiality;
  }
  get status(): ClaimStatus {
    return this._status;
  }
  get verificationMethod(): VerificationMethod | null {
    return this._verificationMethod;
  }
  get evidenceReferences(): string[] {
    return [...this._evidenceReferences];
  }
  get confidence(): number | null {
    return this._confidence;
  }
  get reviewer(): string | null {
    return this._reviewer;
  }
  get verifiedAt(): string | null {
    return this._verifiedAt;
  }
  get createdAt(): string {
    return this._createdAt;
  }
  get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  submit(): void {
    if (this._status !== 'DRAFT') {
      throw new Error('Only draft claims can be submitted');
    }
    this._status = 'SUBMITTED';
  }

  linkEvidence(evidenceId: string): void {
    if (!this._evidenceReferences.includes(evidenceId)) {
      this._evidenceReferences.push(evidenceId);
    }
  }

  verify(params: { verifier: string; method: VerificationMethod; confidence?: number }): void {
    if (this._status === 'VERIFIED') {
      throw new Error('Claim is already verified');
    }
    if (params.confidence !== undefined && (params.confidence < 0 || params.confidence > 100)) {
      throw new Error('Confidence must be between 0 and 100');
    }
    this._status = 'VERIFIED';
    this._reviewer = params.verifier;
    this._verificationMethod = params.method;
    this._confidence = params.confidence ?? null;
    this._verifiedAt = new Date().toISOString();
  }

  reject(reviewer: string, reason: string): void {
    if (this._status === 'VERIFIED') {
      throw new Error('Cannot reject a verified claim without re-verification');
    }
    this._status = 'REJECTED';
    this._reviewer = reviewer;
    this._rejectionReason = reason;
  }

  requestReVerification(reviewer: string): void {
    this._status = 'RE_VERIFICATION';
    this._reviewer = reviewer;
  }

  expire(): void {
    this._status = 'EXPIRED';
  }
}
