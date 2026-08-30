import { TenantId } from '@daos/shared-kernel';

import { Tenant } from '../../../domain/aggregates/tenant.aggregate';
import { TenantStatus } from '../../../domain/value-objects/status';
import { WhiteLabelConfig } from '../../../domain/value-objects/white-label-config';
import { TenantOrmEntity } from '../entities/tenant.orm-entity';

export class TenantMapper {
  static toDomain(e: TenantOrmEntity): Tenant {
    const wl = e.whiteLabel as {
      brandColor?: string;
      logoUrl?: string;
      customDomain?: string;
      featureFlags?: Record<string, boolean>;
    };
    return Tenant.reconstruct({
      id: TenantId.create(e.id),
      subdomain: e.subdomain,
      name: e.name,
      status: e.status as TenantStatus,
      whiteLabel: WhiteLabelConfig.create({
        brandColor: wl.brandColor ?? '#000000',
        logoUrl: wl.logoUrl ?? null,
        customDomain: wl.customDomain ?? null,
        featureFlags: wl.featureFlags ?? {},
      }),
      version: e.version,
    });
  }

  static toOrm(domain: Tenant): TenantOrmEntity {
    const e = new TenantOrmEntity();
    e.id = domain.id.value;
    e.subdomain = domain.subdomain;
    e.name = domain.name;
    e.status = domain.status;
    e.version = domain.version;
    e.whiteLabel = {
      brandColor: domain.whiteLabel.brandColor,
      logoUrl: domain.whiteLabel.logoUrl,
      customDomain: domain.whiteLabel.customDomain,
      featureFlags: domain.whiteLabel.featureFlags,
    };
    return e;
  }
}
