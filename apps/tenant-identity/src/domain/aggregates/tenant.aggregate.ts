import { AggregateRoot, TenantId } from '@daos/shared-kernel';

import { TenantProvisioned } from '../events/tenant-provisioned.event';
import { TenantStatus } from '../value-objects/status';
import { WhiteLabelConfig } from '../value-objects/white-label-config';

export class Tenant extends AggregateRoot {
  private constructor(
    public readonly id: TenantId,
    public readonly subdomain: string,
    private _name: string,
    private _status: TenantStatus,
    private _whiteLabel: WhiteLabelConfig,
  ) {
    super();
  }

  static provision(params: { subdomain: string; name: string }): Tenant {
    const subdomain = params.subdomain.trim().toLowerCase();
    if (!/^[a-z0-9-]{3,63}$/.test(subdomain)) {
      throw new Error(`Invalid subdomain: ${params.subdomain}`);
    }
    if (!params.name.trim()) throw new Error('Tenant name is required');
    const tenant = new Tenant(
      TenantId.create(),
      subdomain,
      params.name.trim(),
      TenantStatus.Provisioning,
      WhiteLabelConfig.default(),
    );
    tenant.raise(new TenantProvisioned(tenant.id.value, tenant.id.value, subdomain, tenant.name));
    return tenant;
  }

  static reconstruct(params: {
    id: TenantId;
    subdomain: string;
    name: string;
    status: TenantStatus;
    whiteLabel: WhiteLabelConfig;
    version: number;
  }): Tenant {
    const tenant = new Tenant(params.id, params.subdomain, params.name, params.status, params.whiteLabel);
    tenant._version = params.version;
    return tenant;
  }

  get name(): string {
    return this._name;
  }

  get status(): TenantStatus {
    return this._status;
  }

  get whiteLabel(): WhiteLabelConfig {
    return this._whiteLabel;
  }

  activate(): void {
    if (this._status !== TenantStatus.Provisioning) {
      throw new Error('Only provisioning tenants can be activated');
    }
    this._status = TenantStatus.Active;
    this.incrementVersion();
  }

  suspend(): void {
    if (this._status !== TenantStatus.Active) {
      throw new Error('Only active tenants can be suspended');
    }
    this._status = TenantStatus.Suspended;
    this.incrementVersion();
  }

  updateWhiteLabel(config: WhiteLabelConfig): void {
    if (this._status !== TenantStatus.Active) {
      throw new Error('White-label config can only be updated while active');
    }
    this._whiteLabel = config;
    this.incrementVersion();
  }
}
