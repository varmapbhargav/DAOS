import { IdempotencyStore, TenantId } from '@daos/shared-kernel';
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { IdentityProvider } from '../../../domain/ports/identity-provider.port';
import {
  IDEMPOTENCY_STORE,
  IDENTITY_PROVIDER,
  ROLE_REPOSITORY,
} from '../../../domain/repositories/repository.tokens';
import { RoleRepository } from '../../../domain/repositories/role.repository';
import { AuthContext } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(IDENTITY_PROVIDER) private readonly identity: IdentityProvider,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(IDEMPOTENCY_STORE) private readonly idempotency: IdempotencyStore,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header: string = request.headers['authorization'] ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new UnauthorizedException('Missing bearer token');

    const claims = this.identity.verifyAccessToken(token);
    if (!claims) throw new UnauthorizedException('Invalid or expired token');

    if (await this.idempotency.seen(`jti-denylist:${claims.jti}`)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const tenantRoles = await this.roles.findAll(TenantId.create(claims.tenantId));
    const permissions = new Set<string>();
    for (const roleId of claims.roleIds) {
      const role = tenantRoles.find((r) => r.id.value === roleId);
      role?.permissionList.forEach((p) => permissions.add(p.toString()));
    }

    const auth: AuthContext = {
      userId: claims.sub,
      tenantId: claims.tenantId,
      roleIds: claims.roleIds,
      permissions: [...permissions],
      platform: claims.platform,
      jti: claims.jti,
    };
    request.auth = auth;
    return true;
  }
}
