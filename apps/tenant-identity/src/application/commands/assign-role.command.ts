import { NotFoundError, OutboxPublisher, RoleId, TenantContextHolder, TenantId, UserId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OUTBOX_PUBLISHER, ROLE_REPOSITORY, USER_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { AssignRoleDto } from '../dto/assign-role.dto';

export class AssignRoleCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: AssignRoleDto,
  ) {}
}

@CommandHandler(AssignRoleCommand)
export class AssignRoleHandler implements ICommandHandler<AssignRoleCommand, void> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: AssignRoleCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const user = await this.users.findById(tenantId, UserId.create(command.userId));
    if (!user) throw new NotFoundError(`User not found: ${command.userId}`);

    const roleId = RoleId.create(command.dto.roleId);
    if (!(await this.roles.findById(tenantId, roleId))) {
      throw new NotFoundError(`Role not found: ${command.dto.roleId}`);
    }

    user.assignRole(roleId);
    await this.users.save(user);
    await this.outbox.publish(user.pullEvents());
  }
}
