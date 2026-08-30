import { UserProfileDto } from '@daos/identity-api';
import { NotFoundError, TenantContextHolder, TenantId, UserId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { USER_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { UserRepository } from '../../domain/repositories/user.repository';

export class GetUserQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, UserProfileDto> {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(query: GetUserQuery): Promise<UserProfileDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const user = await this.users.findById(tenantId, UserId.create(query.userId));
    if (!user) throw new NotFoundError(`User not found: ${query.userId}`);
    return {
      id: user.id.value,
      tenantId: user.tenantId.value,
      email: user.email.value,
      status: user.status,
      roleIds: user.roleIds.map((r) => r.value),
    };
  }
}
