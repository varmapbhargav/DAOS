import {
  DomainInvariantError,
  NotFoundError,
  OutboxPublisher,
  RoleId,
  TenantContextHolder,
  TenantId,
  UserId,
} from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OUTBOX_PUBLISHER, ROLE_REPOSITORY, USER_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { ROLE_NAMES } from '../../domain/services/default-roles';

export class RevokeRoleCommand {
  constructor(
    public readonly userId: string,
    public readonly roleId: string,
  ) {}
}

@CommandHandler(RevokeRoleCommand)
export class RevokeRoleHandler implements ICommandHandler<RevokeRoleCommand, void> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RevokeRoleCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const user = await this.users.findById(tenantId, UserId.create(command.userId));
    if (!user) throw new NotFoundError(`User not found: ${command.userId}`);

    const roleId = RoleId.create(command.roleId);
    const role = await this.roles.findById(tenantId, roleId);
    if (!role) throw new NotFoundError(`Role not found: ${command.roleId}`);

    if (role.name === ROLE_NAMES.tenantAdmin && user.hasRole(roleId)) {
      const activeAdmins = await this.users.countActiveWithRole(tenantId, roleId);
      if (activeAdmins <= 1) throw new DomainInvariantError('Cannot revoke the last active admin role');
    }

    user.revokeRole(roleId);
    await this.users.save(user);
    await this.outbox.publish(user.pullEvents());
  }
}
