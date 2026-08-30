import { Email, InvalidCredentialsError } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IdentityProvider, IssuedTokens } from '../../domain/ports/identity-provider.port';
import {
  IDENTITY_PROVIDER,
  TENANT_REPOSITORY,
  USER_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { TenantRepository } from '../../domain/repositories/tenant.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { TenantStatus, UserStatus } from '../../domain/value-objects/status';
import { LoginDto } from '../dto/login.dto';

export class LoginCommand {
  constructor(public readonly dto: LoginDto) {}
}

export interface LoginResult extends IssuedTokens {
  userId: string;
  tenantId: string;
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, LoginResult> {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenants: TenantRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(IDENTITY_PROVIDER) private readonly identity: IdentityProvider,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const dto = command.dto;
    const tenant = await this.tenants.findBySubdomain(dto.subdomain.toLowerCase());
    if (!tenant || tenant.status !== TenantStatus.Active) throw new InvalidCredentialsError();

    const user = await this.users.findByEmail(tenant.id, Email.create(dto.email));
    if (!user || user.status !== UserStatus.Active) throw new InvalidCredentialsError();

    if (!(await this.identity.verifyPassword(dto.password, user.passwordHash))) {
      throw new InvalidCredentialsError();
    }

    const tokens = this.identity.issueTokens({
      userId: user.id.value,
      tenantId: tenant.id.value,
      roleIds: user.roleIds.map((r) => r.value),
      platform: tenant.subdomain === 'platform',
    });
    return { ...tokens, userId: user.id.value, tenantId: tenant.id.value };
  }
}
