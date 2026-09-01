import { OwnershipId, OwnershipType, OwnershipVerificationStatus, TenantId } from '@daos/shared-kernel';

export class Ownership {
  private constructor(
    public readonly id: OwnershipId,
    public readonly tenantId: TenantId,
    public readonly assetId: string,
    private _entityId: string | null,
    private _personId: string | null,
    private _ownershipType: OwnershipType,
    private _ownershipPercentage: number | null,
    private _economicInterestPercentage: number | null,
    private _controlPercentage: number | null,
    private _acquisitionDate: string | null,
    private _effectiveFrom: string,
    private _effectiveTo: string | null,
    private _evidenceReferences: string[],
    private _verificationStatus: OwnershipVerificationStatus,
    private _verifiedBy: string | null,
    private _verifiedAt: string | null,
    private _notes: string | null,
  ) {}

  static create(params: {
    tenantId: TenantId;
    assetId: string;
    entityId?: string | null;
    personId?: string | null;
    ownershipType: OwnershipType;
    ownershipPercentage?: number | null;
    economicInterestPercentage?: number | null;
    controlPercentage?: number | null;
    acquisitionDate?: string | null;
    effectiveFrom?: string;
    effectiveTo?: string | null;
    evidenceReferences?: string[];
    notes?: string | null;
  }): Ownership {
    return new Ownership(
      OwnershipId.create(),
      params.tenantId,
      params.assetId,
      params.entityId ?? null,
      params.personId ?? null,
      params.ownershipType,
      params.ownershipPercentage ?? null,
      params.economicInterestPercentage ?? null,
      params.controlPercentage ?? null,
      params.acquisitionDate ?? null,
      params.effectiveFrom ?? new Date().toISOString(),
      params.effectiveTo ?? null,
      params.evidenceReferences ?? [],
      'UNVERIFIED',
      null,
      null,
      params.notes ?? null,
    );
  }

  static reconstruct(params: {
    id: OwnershipId;
    tenantId: TenantId;
    assetId: string;
    entityId: string | null;
    personId: string | null;
    ownershipType: OwnershipType;
    ownershipPercentage: number | null;
    economicInterestPercentage: number | null;
    controlPercentage: number | null;
    acquisitionDate: string | null;
    effectiveFrom: string;
    effectiveTo: string | null;
    evidenceReferences: string[];
    verificationStatus: OwnershipVerificationStatus;
    verifiedBy: string | null;
    verifiedAt: string | null;
    notes: string | null;
  }): Ownership {
    return new Ownership(
      params.id,
      params.tenantId,
      params.assetId,
      params.entityId,
      params.personId,
      params.ownershipType,
      params.ownershipPercentage,
      params.economicInterestPercentage,
      params.controlPercentage,
      params.acquisitionDate,
      params.effectiveFrom,
      params.effectiveTo,
      params.evidenceReferences,
      params.verificationStatus,
      params.verifiedBy,
      params.verifiedAt,
      params.notes,
    );
  }

  get entityId(): string | null {
    return this._entityId;
  }
  get personId(): string | null {
    return this._personId;
  }
  get ownershipType(): OwnershipType {
    return this._ownershipType;
  }
  get ownershipPercentage(): number | null {
    return this._ownershipPercentage;
  }
  get economicInterestPercentage(): number | null {
    return this._economicInterestPercentage;
  }
  get controlPercentage(): number | null {
    return this._controlPercentage;
  }
  get acquisitionDate(): string | null {
    return this._acquisitionDate;
  }
  get effectiveFrom(): string {
    return this._effectiveFrom;
  }
  get effectiveTo(): string | null {
    return this._effectiveTo;
  }
  get evidenceReferences(): string[] {
    return [...this._evidenceReferences];
  }
  get verificationStatus(): OwnershipVerificationStatus {
    return this._verificationStatus;
  }
  get verifiedBy(): string | null {
    return this._verifiedBy;
  }
  get verifiedAt(): string | null {
    return this._verifiedAt;
  }
  get notes(): string | null {
    return this._notes;
  }

  updateOwnership(percentage: number | null, economic: number | null, control: number | null): void {
    this._ownershipPercentage = percentage;
    this._economicInterestPercentage = economic;
    this._controlPercentage = control;
  }

  addEvidenceReference(reference: string): void {
    if (!this._evidenceReferences.includes(reference)) {
      this._evidenceReferences.push(reference);
    }
  }

  verify(by: string): void {
    this._verificationStatus = 'VERIFIED';
    this._verifiedBy = by;
    this._verifiedAt = new Date().toISOString();
  }

  reject(by: string): void {
    this._verificationStatus = 'REJECTED';
    this._verifiedBy = by;
    this._verifiedAt = new Date().toISOString();
  }

  expire(): void {
    this._verificationStatus = 'EXPIRED';
  }

  terminate(): void {
    this._effectiveTo = new Date().toISOString();
  }
}
