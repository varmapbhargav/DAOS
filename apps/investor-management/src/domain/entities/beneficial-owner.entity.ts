import { BeneficialOwnerId, TenantId } from '@daos/shared-kernel';

export class BeneficialOwner {
  private constructor(
    public readonly id: BeneficialOwnerId,
    public readonly tenantId: TenantId,
    private readonly _investorId: string,
    private readonly _name: string,
    private readonly _nationality: string,
    private readonly _ownershipPercentage: number,
  ) {}

  static create(params: {
    tenantId: TenantId;
    investorId: string;
    name: string;
    nationality: string;
    ownershipPercentage: number;
  }): BeneficialOwner {
    if (!params.name.trim()) throw new Error('Beneficial owner name is required');
    if (params.ownershipPercentage <= 0 || params.ownershipPercentage > 100) {
      throw new Error('Ownership percentage must be between 0 and 100');
    }
    return new BeneficialOwner(
      BeneficialOwnerId.create(),
      params.tenantId,
      params.investorId,
      params.name.trim(),
      params.nationality,
      params.ownershipPercentage,
    );
  }

  static reconstruct(params: {
    id: BeneficialOwnerId;
    tenantId: TenantId;
    investorId: string;
    name: string;
    nationality: string;
    ownershipPercentage: number;
  }): BeneficialOwner {
    return new BeneficialOwner(
      params.id,
      params.tenantId,
      params.investorId,
      params.name,
      params.nationality,
      params.ownershipPercentage,
    );
  }

  get investorId(): string {
    return this._investorId;
  }

  get name(): string {
    return this._name;
  }

  get nationality(): string {
    return this._nationality;
  }

  get ownershipPercentage(): number {
    return this._ownershipPercentage;
  }
}
