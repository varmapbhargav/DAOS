import { MeResponseDto } from '@daos/identity-api';
import { NotFoundError, TenantContextHolder, TenantId, UserId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TENANT_REPOSITORY, USER_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { TenantRepository } from '../../domain/repositories/tenant.repository';
import { UserRepository } from '../../domain/repositories/user.repository';

export class GetMyProfileQuery {}

@QueryHandler(GetMyProfileQuery)
export class GetMyProfileHandler implements IQueryHandler<GetMyProfileQuery, MeResponseDto> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TENANT_REPOSITORY) private readonly tenants: TenantRepository,
  ) {}

  async execute(): Promise<MeResponseDto> {
    const ctx = TenantContextHolder.get();
    if (!ctx.tenantId || !ctx.userId) throw new NotFoundError('Not authenticated');
    const tenantId = TenantId.create(ctx.tenantId);

    const user = await this.users.findById(tenantId, UserId.create(ctx.userId));
    if (!user) throw new NotFoundError('User not found');
    const tenant = await this.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundError('Tenant not found');

    return {
      user: {
        id: user.id.value,
        tenantId: user.tenantId.value,
        email: user.email.value,
        status: user.status,
        roleIds: user.roleIds.map((r) => r.value),
      },
      tenant: { id: tenant.id.value, subdomain: tenant.subdomain, name: tenant.name, status: tenant.status },
      whiteLabel: {
        brandColor: tenant.whiteLabel.brandColor,
        logoUrl: tenant.whiteLabel.logoUrl,
        customDomain: tenant.whiteLabel.customDomain,
        featureFlags: tenant.whiteLabel.featureFlags,
      },
    };
  }
}
