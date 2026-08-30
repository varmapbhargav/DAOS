import { RoleDto } from '@daos/identity-api';
import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ROLE_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { RoleRepository } from '../../domain/repositories/role.repository';

export class ListRolesQuery {}

@QueryHandler(ListRolesQuery)
export class ListRolesHandler implements IQueryHandler<ListRolesQuery, RoleDto[]> {
  constructor(@Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository) {}

  async execute(): Promise<RoleDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const roles = await this.roles.findAll(tenantId);
    return roles.map((role) => ({
      id: role.id.value,
      tenantId: role.tenantId.value,
      name: role.name,
      permissions: role.permissionList.map((p) => p.toString()),
    }));
  }
}
