import { Email, OutboxPublisher } from '@daos/shared-kernel';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Tenant } from '../../domain/aggregates/tenant.aggregate';
import { User } from '../../domain/aggregates/user.aggregate';
import { Role } from '../../domain/entities/role.entity';
import { IdentityProvider } from '../../domain/ports/identity-provider.port';
import {
  IDENTITY_PROVIDER,
  OUTBOX_PUBLISHER,
  ROLE_REPOSITORY,
  TENANT_REPOSITORY,
  USER_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { TenantRepository } from '../../domain/repositories/tenant.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { ROLE_NAMES } from '../../domain/services/default-roles';
import { Permission } from '../../domain/value-objects/permission';

export const PLATFORM_SUBDOMAIN = 'platform';

@Injectable()
export class PlatformSeeder implements OnModuleInit {
  private readonly logger = new Logger(PlatformSeeder.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(TENANT_REPOSITORY) private readonly tenants: TenantRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(IDENTITY_PROVIDER) private readonly identity: IdentityProvider,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async onModuleInit(): Promise<void> {
    if (await this.tenants.findBySubdomain(PLATFORM_SUBDOMAIN)) return;

    const tenant = Tenant.provision({ subdomain: PLATFORM_SUBDOMAIN, name: 'Platform' });
    tenant.activate();

    const platformRole = Role.create({
      tenantId: tenant.id,
      name: ROLE_NAMES.platformAdmin,
      permissions: [
        Permission.parse('tenant:provision'),
        Permission.parse('tenant:read'),
        Permission.parse('user:read'),
        Permission.parse('role:read'),
      ],
    });

    const email = this.config.get<string>('PLATFORM_ADMIN_EMAIL') ?? 'admin@platform.local';
    const password = this.config.get<string>('PLATFORM_ADMIN_PASSWORD') ?? 'platform-admin-password';
    const passwordHash = await this.identity.hashPassword(password);

    const admin = User.onboard({
      tenantId: tenant.id,
      email: Email.create(email),
      passwordHash,
      roleIds: [platformRole.id],
    });

    await this.tenants.save(tenant);
    await this.roles.saveAll([platformRole]);
    await this.users.save(admin);
    await this.outbox.publish([...tenant.pullEvents(), ...admin.pullEvents()]);
    this.logger.log(`Seeded platform tenant and admin user ${email}`);
  }
}
