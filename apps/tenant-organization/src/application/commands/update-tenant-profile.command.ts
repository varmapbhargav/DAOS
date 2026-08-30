import { NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OUTBOX_PUBLISHER, TENANT_PROFILE_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { TenantProfileRepository } from '../../domain/repositories/tenant-profile.repository';
import { UpdateTenantProfileDto } from '../dto/organization.dto';

export class UpdateTenantProfileCommand {
  constructor(public readonly dto: UpdateTenantProfileDto) {}
}

@CommandHandler(UpdateTenantProfileCommand)
export class UpdateTenantProfileHandler implements ICommandHandler<UpdateTenantProfileCommand, { profileId: string }> {
  constructor(
    @Inject(TENANT_PROFILE_REPOSITORY) private readonly profiles: TenantProfileRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: UpdateTenantProfileCommand): Promise<{ profileId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const profile = await this.profiles.findByTenantId(tenantId);
    if (!profile) {
      throw new NotFoundError('Organization profile not found. Provision the tenant profile first.');
    }
    profile.updateProfile(command.dto);
    await this.profiles.save(profile);
    await this.outbox.publish(profile.pullEvents());
    return { profileId: profile.id.value };
  }
}
