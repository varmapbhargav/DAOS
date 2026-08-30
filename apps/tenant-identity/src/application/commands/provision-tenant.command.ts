import { ConflictError, Email, OutboxPublisher, TenantContextHolder } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
import { TenantProvisioningService } from '../../domain/services/tenant-provisioning.service';
import { ProvisionTenantDto } from '../dto/provision-tenant.dto';

export class ProvisionTenantCommand {
  constructor(public readonly dto: ProvisionTenantDto) {}
}

@CommandHandler(ProvisionTenantCommand)
export class ProvisionTenantHandler implements ICommandHandler<ProvisionTenantCommand, { tenantId: string }> {
  constructor(
    private readonly provisioning: TenantProvisioningService,
    @Inject(TENANT_REPOSITORY) private readonly tenants: TenantRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(IDENTITY_PROVIDER) private readonly identity: IdentityProvider,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ProvisionTenantCommand): Promise<{ tenantId: string }> {
    const dto = command.dto;
    if (!TenantContextHolder.get().isPlatform) {
      throw new ConflictError('Tenant provisioning requires the platform context');
    }
    const subdomain = dto.subdomain.toLowerCase();
    if (await this.tenants.findBySubdomain(subdomain)) {
      throw new ConflictError(`Subdomain already in use: ${subdomain}`);
    }

    const adminPasswordHash = await this.identity.hashPassword(dto.adminPassword);
    const { tenant, admin, roles } = this.provisioning.provision({
      subdomain,
      name: dto.name,
      adminEmail: Email.create(dto.adminEmail),
      adminPasswordHash,
    });

    tenant.activate();
    await this.tenants.save(tenant);
    await this.roles.saveAll(roles);
    await this.users.save(admin);

    await this.outbox.publish([...tenant.pullEvents(), ...admin.pullEvents()]);
    return { tenantId: tenant.id.value };
  }
}
