import { NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BillingPlanEnforcer } from '../../domain/services/billing-plan-enforcer.service';
import { UsageMeteringService } from '../../domain/services/usage-metering.service';
import { OUTBOX_PUBLISHER, SERVICE_ENTITLEMENT_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ServiceEntitlementRepository } from '../../domain/repositories/service-entitlement.repository';
import { RecordUsageDto } from '../dto/organization.dto';

export class RecordUsageCommand {
  constructor(public readonly dto: RecordUsageDto) {}
}

@CommandHandler(RecordUsageCommand)
export class RecordUsageHandler implements ICommandHandler<RecordUsageCommand, { entitlementId: string }> {
  constructor(
    @Inject(SERVICE_ENTITLEMENT_REPOSITORY) private readonly entitlements: ServiceEntitlementRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
    private readonly usageMetering: UsageMeteringService,
    private readonly enforcer: BillingPlanEnforcer,
  ) {}

  async execute(command: RecordUsageCommand): Promise<{ entitlementId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const entitlement = await this.entitlements.findByTenantId(tenantId);
    if (!entitlement) {
      throw new NotFoundError('Service entitlement not found. Provision default entitlement first.');
    }
    const newUsage = this.usageMetering.computeNewUsage(entitlement, command.dto.apiCallsDelta, command.dto.seatsUsed);
    this.enforcer.assertUsageWithinLimits(entitlement, newUsage.apiCalls, newUsage.seatsUsed);
    entitlement.recordUsage(newUsage.apiCalls, newUsage.seatsUsed);
    await this.entitlements.save(entitlement);
    await this.outbox.publish(entitlement.pullEvents());
    return { entitlementId: entitlement.id.value };
  }
}
