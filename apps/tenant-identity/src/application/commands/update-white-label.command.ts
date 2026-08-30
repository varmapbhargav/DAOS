import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TENANT_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { TenantRepository } from '../../domain/repositories/tenant.repository';
import { WhiteLabelConfig } from '../../domain/value-objects/white-label-config';
import { UpdateWhiteLabelDto } from '../dto/update-white-label.dto';

export class UpdateWhiteLabelCommand {
  constructor(public readonly dto: UpdateWhiteLabelDto) {}
}

@CommandHandler(UpdateWhiteLabelCommand)
export class UpdateWhiteLabelHandler implements ICommandHandler<UpdateWhiteLabelCommand, void> {
  constructor(@Inject(TENANT_REPOSITORY) private readonly tenants: TenantRepository) {}

  async execute(command: UpdateWhiteLabelCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const tenant = await this.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundError('Tenant not found');

    const config = WhiteLabelConfig.create({
      brandColor: command.dto.brandColor,
      logoUrl: command.dto.logoUrl ?? null,
      customDomain: command.dto.customDomain ?? null,
      featureFlags: command.dto.featureFlags ?? {},
    });
    tenant.updateWhiteLabel(config);
    await this.tenants.save(tenant);
  }
}
