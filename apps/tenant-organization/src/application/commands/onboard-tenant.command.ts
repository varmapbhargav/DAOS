import { OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ServiceEntitlement } from '../../domain/aggregates/service-entitlement.aggregate';
import { TenantProfile } from '../../domain/aggregates/tenant-profile.aggregate';
import {
  API_KEY_REPOSITORY,
  OUTBOX_PUBLISHER,
  SERVICE_ENTITLEMENT_REPOSITORY,
  TENANT_PROFILE_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { ApiKeyRepository } from '../../domain/repositories/api-key.repository';
import { ServiceEntitlementRepository } from '../../domain/repositories/service-entitlement.repository';
import { TenantProfileRepository } from '../../domain/repositories/tenant-profile.repository';
import { OnboardTenantDto } from '../dto/organization.dto';

export class OnboardTenantCommand {
  constructor(public readonly dto: OnboardTenantDto) {}
}

@CommandHandler(OnboardTenantCommand)
export class OnboardTenantHandler implements ICommandHandler<OnboardTenantCommand, { profileId: string; entitlementId: string }> {
  constructor(
    @Inject(TENANT_PROFILE_REPOSITORY) private readonly profiles: TenantProfileRepository,
    @Inject(SERVICE_ENTITLEMENT_REPOSITORY) private readonly entitlements: ServiceEntitlementRepository,
    @Inject(API_KEY_REPOSITORY) private readonly apiKeys: ApiKeyRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: OnboardTenantCommand): Promise<{ profileId: string; entitlementId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    let profile = await this.profiles.findByTenantId(tenantId);
    if (!profile) {
      profile = TenantProfile.create(tenantId, command.dto.orgName);
    }
    let entitlement = await this.entitlements.findByTenantId(tenantId);
    if (!entitlement) {
      entitlement = ServiceEntitlement.createDefault(tenantId);
    }
    await this.profiles.save(profile);
    await this.entitlements.save(entitlement);
    await this.outbox.publish([...profile.pullEvents(), ...entitlement.pullEvents()]);
    return { profileId: profile.id.value, entitlementId: entitlement.id.value };
  }
}
