import { UserProfileDto } from '@daos/identity-api';
import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { USER_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { UserRepository } from '../../domain/repositories/user.repository';

export class ListUsersQuery {}

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery, UserProfileDto[]> {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(): Promise<UserProfileDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const users = await this.users.findAll(tenantId);
    return users.map((user) => ({
      id: user.id.value,
      tenantId: user.tenantId.value,
      email: user.email.value,
      status: user.status,
      roleIds: user.roleIds.map((r) => r.value),
    }));
  }
}
