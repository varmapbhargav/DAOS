import { InvalidCredentialsError, TenantId, UserId } from '@daos/shared-kernel';
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
import { UserStatus } from '../../domain/value-objects/status';
import { RefreshDto } from '../dto/refresh.dto';

export class RefreshTokenCommand {
  constructor(public readonly dto: RefreshDto) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand, IssuedTokens> {
  constructor(
    @Inject(IDENTITY_PROVIDER) private readonly identity: IdentityProvider,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TENANT_REPOSITORY) private readonly tenants: TenantRepository,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<IssuedTokens> {
    const claims = this.identity.verifyRefreshToken(command.dto.refreshToken);
    if (!claims) throw new InvalidCredentialsError('Invalid refresh token');

    const tenantId = TenantId.create(claims.tenantId);
    const user = await this.users.findById(tenantId, UserId.create(claims.sub));
    if (!user || user.status !== UserStatus.Active) throw new InvalidCredentialsError();

    const tenant = await this.tenants.findById(tenantId);
    return this.identity.issueTokens({
      userId: user.id.value,
      tenantId: tenantId.value,
      roleIds: user.roleIds.map((r) => r.value),
      platform: tenant?.subdomain === 'platform',
    });
  }
}
