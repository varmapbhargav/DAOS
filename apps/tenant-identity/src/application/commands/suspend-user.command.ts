import { DomainInvariantError, NotFoundError, TenantContextHolder, TenantId, UserId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ROLE_REPOSITORY, USER_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { ROLE_NAMES } from '../../domain/services/default-roles';

export class SuspendUserCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(SuspendUserCommand)
export class SuspendUserHandler implements ICommandHandler<SuspendUserCommand, void> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
  ) {}

  async execute(command: SuspendUserCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const user = await this.users.findById(tenantId, UserId.create(command.userId));
    if (!user) throw new NotFoundError(`User not found: ${command.userId}`);

    const adminRole = await this.roles.findByName(tenantId, ROLE_NAMES.tenantAdmin);
    if (adminRole && user.hasRole(adminRole.id)) {
      const activeAdmins = await this.users.countActiveWithRole(tenantId, adminRole.id);
      if (activeAdmins <= 1) throw new DomainInvariantError('Cannot disable the last active admin');
    }

    user.disable();
    await this.users.save(user);
  }
}
