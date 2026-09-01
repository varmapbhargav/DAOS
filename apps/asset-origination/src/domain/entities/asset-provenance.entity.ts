import { ProvenanceEventId, ProvenanceEventType, ProvenanceVerificationStatus, TenantId } from '@daos/shared-kernel';

export class AssetProvenance {
  private constructor(
    public readonly id: ProvenanceEventId,
    public readonly tenantId: TenantId,
    public readonly assetId: string,
    private _eventType: ProvenanceEventType,
    private _fromEntityId: string | null,
    private _toEntityId: string | null,
    private _effectiveDate: string,
    private _recordedDate: string,
    private _jurisdiction: string | null,
    private _registryReference: string | null,
    private _documentReference: string | null,
    private _transactionReference: string | null,
    private _verificationStatus: ProvenanceVerificationStatus,
    private _evidenceReferences: string[],
    private _hash: string | null,
  ) {}

  static create(params: {
    tenantId: TenantId;
    assetId: string;
    eventType: ProvenanceEventType;
    fromEntityId?: string | null;
    toEntityId?: string | null;
    effectiveDate?: string;
    jurisdiction?: string | null;
    registryReference?: string | null;
    documentReference?: string | null;
    transactionReference?: string | null;
    evidenceReferences?: string[];
    hash?: string | null;
  }): AssetProvenance {
    return new AssetProvenance(
      ProvenanceEventId.create(),
      params.tenantId,
      params.assetId,
      params.eventType,
      params.fromEntityId ?? null,
      params.toEntityId ?? null,
      params.effectiveDate ?? new Date().toISOString(),
      new Date().toISOString(),
      params.jurisdiction ?? null,
      params.registryReference ?? null,
      params.documentReference ?? null,
      params.transactionReference ?? null,
      'UNVERIFIED',
      params.evidenceReferences ?? [],
      params.hash ?? null,
    );
  }

  static reconstruct(params: {
    id: ProvenanceEventId;
    tenantId: TenantId;
    assetId: string;
    eventType: ProvenanceEventType;
    fromEntityId: string | null;
    toEntityId: string | null;
    effectiveDate: string;
    recordedDate: string;
    jurisdiction: string | null;
    registryReference: string | null;
    documentReference: string | null;
    transactionReference: string | null;
    verificationStatus: ProvenanceVerificationStatus;
    evidenceReferences: string[];
    hash: string | null;
  }): AssetProvenance {
    return new AssetProvenance(
      params.id,
      params.tenantId,
      params.assetId,
      params.eventType,
      params.fromEntityId,
      params.toEntityId,
      params.effectiveDate,
      params.recordedDate,
      params.jurisdiction,
      params.registryReference,
      params.documentReference,
      params.transactionReference,
      params.verificationStatus,
      params.evidenceReferences,
      params.hash,
    );
  }

  get eventType(): ProvenanceEventType {
    return this._eventType;
  }
  get fromEntityId(): string | null {
    return this._fromEntityId;
  }
  get toEntityId(): string | null {
    return this._toEntityId;
  }
  get effectiveDate(): string {
    return this._effectiveDate;
  }
  get recordedDate(): string {
    return this._recordedDate;
  }
  get jurisdiction(): string | null {
    return this._jurisdiction;
  }
  get registryReference(): string | null {
    return this._registryReference;
  }
  get documentReference(): string | null {
    return this._documentReference;
  }
  get transactionReference(): string | null {
    return this._transactionReference;
  }
  get verificationStatus(): ProvenanceVerificationStatus {
    return this._verificationStatus;
  }
  get evidenceReferences(): string[] {
    return [...this._evidenceReferences];
  }
  get hash(): string | null {
    return this._hash;
  }

  verify(): void {
    this._verificationStatus = 'VERIFIED';
  }

  reject(): void {
    this._verificationStatus = 'REJECTED';
  }

  addEvidenceReference(reference: string): void {
    if (!this._evidenceReferences.includes(reference)) {
      this._evidenceReferences.push(reference);
    }
  }
}
