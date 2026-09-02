import { EncumbranceId, EncumbranceStatus, EncumbranceType, TenantId } from '@daos/shared-kernel';

export class AssetEncumbrance {
  private constructor(
    public readonly id: EncumbranceId,
    public readonly tenantId: TenantId,
    public readonly assetId: string,
    private _type: EncumbranceType,
    private _holderEntityId: string | null,
    private _amountMinorUnits: string | null,
    private _currency: string | null,
    private _priority: number | null,
    private _registrationNumber: string | null,
    private _effectiveFrom: string,
    private _effectiveTo: string | null,
    private _status: EncumbranceStatus,
    private _releaseConditions: string | null,
    private _evidenceReferences: string[],
    private _verificationStatus: string,
  ) {}

  static create(params: {
    tenantId: TenantId;
    assetId: string;
    type: EncumbranceType;
    holderEntityId?: string | null;
    amountMinorUnits?: string | null;
    currency?: string | null;
    priority?: number | null;
    registrationNumber?: string | null;
    effectiveFrom?: string;
    effectiveTo?: string | null;
    releaseConditions?: string | null;
    evidenceReferences?: string[];
  }): AssetEncumbrance {
    return new AssetEncumbrance(
      EncumbranceId.create(),
      params.tenantId,
      params.assetId,
      params.type,
      params.holderEntityId ?? null,
      params.amountMinorUnits ?? null,
      params.currency ?? null,
      params.priority ?? null,
      params.registrationNumber ?? null,
      params.effectiveFrom ?? new Date().toISOString(),
      params.effectiveTo ?? null,
      'ACTIVE',
      params.releaseConditions ?? null,
      params.evidenceReferences ?? [],
      'UNVERIFIED',
    );
  }

  static reconstruct(params: {
    id: EncumbranceId;
    tenantId: TenantId;
    assetId: string;
    type: EncumbranceType;
    holderEntityId: string | null;
    amountMinorUnits: string | null;
    currency: string | null;
    priority: number | null;
    registrationNumber: string | null;
    effectiveFrom: string;
    effectiveTo: string | null;
    status: EncumbranceStatus;
    releaseConditions: string | null;
    evidenceReferences: string[];
    verificationStatus: string;
  }): AssetEncumbrance {
    return new AssetEncumbrance(
      params.id,
      params.tenantId,
      params.assetId,
      params.type,
      params.holderEntityId,
      params.amountMinorUnits,
      params.currency,
      params.priority,
      params.registrationNumber,
      params.effectiveFrom,
      params.effectiveTo,
      params.status,
      params.releaseConditions,
      params.evidenceReferences,
      params.verificationStatus,
    );
  }

  get type(): EncumbranceType {
    return this._type;
  }
  get holderEntityId(): string | null {
    return this._holderEntityId;
  }
  get amountMinorUnits(): string | null {
    return this._amountMinorUnits;
  }
  get currency(): string | null {
    return this._currency;
  }
  get priority(): number | null {
    return this._priority;
  }
  get registrationNumber(): string | null {
    return this._registrationNumber;
  }
  get effectiveFrom(): string {
    return this._effectiveFrom;
  }
  get effectiveTo(): string | null {
    return this._effectiveTo;
  }
  get status(): EncumbranceStatus {
    return this._status;
  }
  get releaseConditions(): string | null {
    return this._releaseConditions;
  }
  get evidenceReferences(): string[] {
    return [...this._evidenceReferences];
  }
  get verificationStatus(): string {
    return this._verificationStatus;
  }

  release(): void {
    if (this._status === 'RELEASED') {
      throw new Error('Encumbrance is already released');
    }
    this._status = 'RELEASED';
    this._effectiveTo = new Date().toISOString();
  }

  addEvidenceReference(reference: string): void {
    if (!this._evidenceReferences.includes(reference)) {
      this._evidenceReferences.push(reference);
    }
  }

  verify(status: string): void {
    this._verificationStatus = status;
  }

  setAmount(amountMinorUnits: string | null, currency: string | null): void {
    this._amountMinorUnits = amountMinorUnits;
    this._currency = currency;
  }
}
