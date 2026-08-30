import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TENANT_PROFILE_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { TenantProfileRepository } from '../../domain/repositories/tenant-profile.repository';
import { toTenantProfileDto, TenantProfileDto } from '../organization.mapper';

export class GetTenantProfileQuery {}

@QueryHandler(GetTenantProfileQuery)
export class GetTenantProfileHandler implements IQueryHandler<GetTenantProfileQuery, TenantProfileDto> {
  constructor(@Inject(TENANT_PROFILE_REPOSITORY) private readonly profiles: TenantProfileRepository) {}

  async execute(): Promise<TenantProfileDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const profile = await this.profiles.findByTenantId(tenantId);
    if (!profile) throw new NotFoundError('Organization profile not found');
    return toTenantProfileDto(profile);
  }
}
