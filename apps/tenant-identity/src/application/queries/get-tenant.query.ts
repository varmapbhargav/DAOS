import { TenantDetailDto } from '@daos/identity-api';
import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TENANT_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { TenantRepository } from '../../domain/repositories/tenant.repository';

export class GetTenantQuery {}

@QueryHandler(GetTenantQuery)
export class GetTenantHandler implements IQueryHandler<GetTenantQuery, TenantDetailDto> {
  constructor(@Inject(TENANT_REPOSITORY) private readonly tenants: TenantRepository) {}

  async execute(): Promise<TenantDetailDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const tenant = await this.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundError('Tenant not found');
    return {
      id: tenant.id.value,
      subdomain: tenant.subdomain,
      name: tenant.name,
      status: tenant.status,
      whiteLabel: {
        brandColor: tenant.whiteLabel.brandColor,
        logoUrl: tenant.whiteLabel.logoUrl,
        customDomain: tenant.whiteLabel.customDomain,
        featureFlags: tenant.whiteLabel.featureFlags,
      },
    };
  }
}
