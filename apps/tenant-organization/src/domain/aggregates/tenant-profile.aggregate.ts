import {
  Address,
  OrganizationProfileStatus,
  AggregateRoot,
  TenantId,
  TenantProfileId,
} from '@daos/shared-kernel';

import { OrganizationProfileUpdated } from '../events/organization-profile-updated.event';

export type UpdateOrganizationProfileParams = {
  orgName?: string;
  legalName?: string;
  taxId?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  country?: string;
  addresses?: Address[];
  brandColor?: string;
  logoUrl?: string;
  customDomain?: string;
  featureFlags?: Record<string, boolean>;
};

export class TenantProfile extends AggregateRoot {
  private constructor(
    public readonly id: TenantProfileId,
    public readonly tenantId: TenantId,
    private _orgName: string,
    private _legalName: string,
    private _taxId: string,
    private _website: string,
    private _contactEmail: string,
    private _contactPhone: string,
    private _country: string,
    private _addresses: Address[],
    private _brandColor: string,
    private _logoUrl: string | null,
    private _customDomain: string | null,
    private _featureFlags: Record<string, boolean>,
    private _status: OrganizationProfileStatus,
  ) {
    super();
  }

  static create(tenantId: TenantId, orgName: string): TenantProfile {
    if (!orgName.trim()) throw new Error('Organization name is required');
    if (!/^#[0-9a-fA-F]{6}$/.test('#000000')) throw new Error('brandColor must be a #RRGGBB hex value');
    const profile = new TenantProfile(
      TenantProfileId.create(),
      tenantId,
      orgName.trim(),
      '',
      '',
      '',
      '',
      '',
      '',
      [],
      '#000000',
      null,
      null,
      {},
      'active',
    );
    profile.incrementVersion();
    return profile;
  }

  updateProfile(params: UpdateOrganizationProfileParams): void {
    if (this._status !== 'active') throw new Error('Organization profile can only be updated while active');
    if (params.orgName !== undefined) {
      if (!params.orgName.trim()) throw new Error('Organization name is required');
      this._orgName = params.orgName.trim();
    }
    if (params.legalName !== undefined) this._legalName = params.legalName.trim();
    if (params.taxId !== undefined) this._taxId = params.taxId.trim();
    if (params.website !== undefined) this._website = params.website.trim();
    if (params.contactEmail !== undefined) this._contactEmail = params.contactEmail.trim();
    if (params.contactPhone !== undefined) this._contactPhone = params.contactPhone.trim();
    if (params.country !== undefined) this._country = params.country.trim();
    if (params.addresses !== undefined) this._addresses = [...params.addresses];
    if (params.brandColor !== undefined) {
      if (!/^#[0-9a-fA-F]{6}$/.test(params.brandColor)) throw new Error('brandColor must be a #RRGGBB hex value');
      this._brandColor = params.brandColor;
    }
    if (params.logoUrl !== undefined) this._logoUrl = params.logoUrl === '' ? null : params.logoUrl;
    if (params.customDomain !== undefined) this._customDomain = params.customDomain === '' ? null : params.customDomain;
    if (params.featureFlags !== undefined) this._featureFlags = { ...params.featureFlags };
    this.raise(new OrganizationProfileUpdated(this.id.value, this.tenantId.value, this._orgName));
    this.incrementVersion();
  }

  suspend(): void {
    if (this._status !== 'active') throw new Error('Only active organization profiles can be suspended');
    this._status = 'suspended';
    this.incrementVersion();
  }

  activate(): void {
    if (this._status !== 'suspended') throw new Error('Only suspended organization profiles can be activated');
    this._status = 'active';
    this.incrementVersion();
  }

  get orgName(): string {
    return this._orgName;
  }

  get legalName(): string {
    return this._legalName;
  }

  get taxId(): string {
    return this._taxId;
  }

  get website(): string {
    return this._website;
  }

  get contactEmail(): string {
    return this._contactEmail;
  }

  get contactPhone(): string {
    return this._contactPhone;
  }

  get country(): string {
    return this._country;
  }

  get addresses(): Address[] {
    return [...this._addresses];
  }

  get brandColor(): string {
    return this._brandColor;
  }

  get logoUrl(): string | null {
    return this._logoUrl;
  }

  get customDomain(): string | null {
    return this._customDomain;
  }

  get featureFlags(): Record<string, boolean> {
    return { ...this._featureFlags };
  }

  get status(): OrganizationProfileStatus {
    return this._status;
  }

  static reconstruct(params: {
    id: TenantProfileId;
    tenantId: TenantId;
    orgName: string;
    legalName: string;
    taxId: string;
    website: string;
    contactEmail: string;
    contactPhone: string;
    country: string;
    addresses: Address[];
    brandColor: string;
    logoUrl: string | null;
    customDomain: string | null;
    featureFlags: Record<string, boolean>;
    status: OrganizationProfileStatus;
    version: number;
  }): TenantProfile {
    const profile = new TenantProfile(
      params.id,
      params.tenantId,
      params.orgName,
      params.legalName,
      params.taxId,
      params.website,
      params.contactEmail,
      params.contactPhone,
      params.country,
      params.addresses,
      params.brandColor,
      params.logoUrl,
      params.customDomain,
      params.featureFlags,
      params.status,
    );
    profile._version = params.version;
    return profile;
  }
}
