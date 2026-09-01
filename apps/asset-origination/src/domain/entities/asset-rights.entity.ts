import { RightsId, RightType, TenantId } from '@daos/shared-kernel';

export class AssetRights {
  private constructor(
    public readonly id: RightsId,
    public readonly tenantId: TenantId,
    public readonly assetId: string,
    private _rightType: RightType,
    private _holderEntityId: string | null,
    private _holderPersonId: string | null,
    private _percentage: number | null,
    private _priority: number | null,
    private _effectiveFrom: string,
    private _effectiveTo: string | null,
    private _transferable: boolean,
    private _assignable: boolean,
    private _evidenceReferences: string[],
  ) {}

  static create(params: {
    tenantId: TenantId;
    assetId: string;
    rightType: RightType;
    holderEntityId?: string | null;
    holderPersonId?: string | null;
    percentage?: number | null;
    priority?: number | null;
    effectiveFrom?: string;
    effectiveTo?: string | null;
    transferable?: boolean;
    assignable?: boolean;
    evidenceReferences?: string[];
  }): AssetRights {
    return new AssetRights(
      RightsId.create(),
      params.tenantId,
      params.assetId,
      params.rightType,
      params.holderEntityId ?? null,
      params.holderPersonId ?? null,
      params.percentage ?? null,
      params.priority ?? null,
      params.effectiveFrom ?? new Date().toISOString(),
      params.effectiveTo ?? null,
      params.transferable ?? true,
      params.assignable ?? true,
      params.evidenceReferences ?? [],
    );
  }

  static reconstruct(params: {
    id: RightsId;
    tenantId: TenantId;
    assetId: string;
    rightType: RightType;
    holderEntityId: string | null;
    holderPersonId: string | null;
    percentage: number | null;
    priority: number | null;
    effectiveFrom: string;
    effectiveTo: string | null;
    transferable: boolean;
    assignable: boolean;
    evidenceReferences: string[];
  }): AssetRights {
    return new AssetRights(
      params.id,
      params.tenantId,
      params.assetId,
      params.rightType,
      params.holderEntityId,
      params.holderPersonId,
      params.percentage,
      params.priority,
      params.effectiveFrom,
      params.effectiveTo,
      params.transferable,
      params.assignable,
      params.evidenceReferences,
    );
  }

  get rightType(): RightType {
    return this._rightType;
  }
  get holderEntityId(): string | null {
    return this._holderEntityId;
  }
  get holderPersonId(): string | null {
    return this._holderPersonId;
  }
  get percentage(): number | null {
    return this._percentage;
  }
  get priority(): number | null {
    return this._priority;
  }
  get effectiveFrom(): string {
    return this._effectiveFrom;
  }
  get effectiveTo(): string | null {
    return this._effectiveTo;
  }
  get transferable(): boolean {
    return this._transferable;
  }
  get assignable(): boolean {
    return this._assignable;
  }
  get evidenceReferences(): string[] {
    return [...this._evidenceReferences];
  }

  changeHolder(entityId: string | null, personId: string | null): void {
    this._holderEntityId = entityId;
    this._holderPersonId = personId;
  }

  setPercentage(percentage: number | null): void {
    this._percentage = percentage;
  }

  addEvidenceReference(reference: string): void {
    if (!this._evidenceReferences.includes(reference)) {
      this._evidenceReferences.push(reference);
    }
  }

  terminate(): void {
    this._effectiveTo = new Date().toISOString();
  }
}
