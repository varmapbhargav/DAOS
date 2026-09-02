import { CounterpartyId, CounterpartyRole, CounterpartyVerificationStatus, TenantId } from '@daos/shared-kernel';

export type CounterpartyType = 'ENTITY' | 'PERSON';

export class AssetCounterparty {
  private constructor(
    public readonly id: CounterpartyId,
    public readonly tenantId: TenantId,
    public readonly assetId: string,
    private _entityId: string | null,
    private _personId: string | null,
    private _counterpartyType: CounterpartyType,
    private _role: CounterpartyRole,
    private _legalRole: string | null,
    private _economicRole: string | null,
    private _ownershipPercentage: number | null,
    private _effectiveFrom: string,
    private _effectiveTo: string | null,
    private _verificationStatus: CounterpartyVerificationStatus,
    private _complianceStatus: string | null,
    private _evidenceReferences: string[],
  ) {}

  static create(params: {
    tenantId: TenantId;
    assetId: string;
    entityId?: string | null;
    personId?: string | null;
    counterpartyType: CounterpartyType;
    role: CounterpartyRole;
    legalRole?: string | null;
    economicRole?: string | null;
    ownershipPercentage?: number | null;
    effectiveFrom?: string;
    effectiveTo?: string | null;
  }): AssetCounterparty {
    return new AssetCounterparty(
      CounterpartyId.create(),
      params.tenantId,
      params.assetId,
      params.entityId ?? null,
      params.personId ?? null,
      params.counterpartyType,
      params.role,
      params.legalRole ?? null,
      params.economicRole ?? null,
      params.ownershipPercentage ?? null,
      params.effectiveFrom ?? new Date().toISOString(),
      params.effectiveTo ?? null,
      'UNVERIFIED',
      null,
      [],
    );
  }

  static reconstruct(params: {
    id: CounterpartyId;
    tenantId: TenantId;
    assetId: string;
    entityId: string | null;
    personId: string | null;
    counterpartyType: CounterpartyType;
    role: CounterpartyRole;
    legalRole: string | null;
    economicRole: string | null;
    ownershipPercentage: number | null;
    effectiveFrom: string;
    effectiveTo: string | null;
    verificationStatus: CounterpartyVerificationStatus;
    complianceStatus: string | null;
    evidenceReferences: string[];
  }): AssetCounterparty {
    return new AssetCounterparty(
      params.id,
      params.tenantId,
      params.assetId,
      params.entityId,
      params.personId,
      params.counterpartyType,
      params.role,
      params.legalRole,
      params.economicRole,
      params.ownershipPercentage,
      params.effectiveFrom,
      params.effectiveTo,
      params.verificationStatus,
      params.complianceStatus,
      params.evidenceReferences,
    );
  }

  get entityId(): string | null {
    return this._entityId;
  }
  get personId(): string | null {
    return this._personId;
  }
  get counterpartyType(): CounterpartyType {
    return this._counterpartyType;
  }
  get role(): CounterpartyRole {
    return this._role;
  }
  get legalRole(): string | null {
    return this._legalRole;
  }
  get economicRole(): string | null {
    return this._economicRole;
  }
  get ownershipPercentage(): number | null {
    return this._ownershipPercentage;
  }
  get effectiveFrom(): string {
    return this._effectiveFrom;
  }
  get effectiveTo(): string | null {
    return this._effectiveTo;
  }
  get verificationStatus(): CounterpartyVerificationStatus {
    return this._verificationStatus;
  }
  get complianceStatus(): string | null {
    return this._complianceStatus;
  }
  get evidenceReferences(): string[] {
    return [...this._evidenceReferences];
  }

  changeRole(role: CounterpartyRole): void {
    this._role = role;
  }

  changeOwnershipPercentage(percentage: number | null): void {
    this._ownershipPercentage = percentage;
  }

  addEvidenceReference(reference: string): void {
    if (!this._evidenceReferences.includes(reference)) {
      this._evidenceReferences.push(reference);
    }
  }

  setEffectivePeriod(from: string, to: string | null): void {
    this._effectiveFrom = from;
    this._effectiveTo = to;
  }

  verify(status: CounterpartyVerificationStatus): void {
    this._verificationStatus = status;
  }

  setComplianceStatus(status: string | null): void {
    this._complianceStatus = status;
  }

  end(): void {
    this._effectiveTo = new Date().toISOString();
  }
}
