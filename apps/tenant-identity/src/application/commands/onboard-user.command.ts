import {
  ConflictError,
  Email,
  NotFoundError,
  OutboxPublisher,
  RoleId,
  TenantContextHolder,
  TenantId,
} from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { User } from '../../domain/aggregates/user.aggregate';
import { IdentityProvider } from '../../domain/ports/identity-provider.port';
import {
  IDENTITY_PROVIDER,
  OUTBOX_PUBLISHER,
  ROLE_REPOSITORY,
  USER_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { OnboardUserDto } from '../dto/onboard-user.dto';

export class OnboardUserCommand {
  constructor(public readonly dto: OnboardUserDto) {}
}

@CommandHandler(OnboardUserCommand)
export class OnboardUserHandler implements ICommandHandler<OnboardUserCommand, { userId: string }> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(IDENTITY_PROVIDER) private readonly identity: IdentityProvider,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: OnboardUserCommand): Promise<{ userId: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const email = Email.create(dto.email);
    if (await this.users.findByEmail(tenantId, email)) {
      throw new ConflictError(`User already exists: ${dto.email}`);
    }

    const roleIds: RoleId[] = [];
    for (const raw of dto.roleIds) {
      const roleId = RoleId.create(raw);
      if (!(await this.roles.findById(tenantId, roleId))) {
        throw new NotFoundError(`Role not found: ${raw}`);
      }
      roleIds.push(roleId);
    }

    const passwordHash = await this.identity.hashPassword(dto.password);
    const user = User.onboard({ tenantId, email, passwordHash, roleIds });
    await this.users.save(user);
    await this.outbox.publish(user.pullEvents());
    return { userId: user.id.value };
  }
}
