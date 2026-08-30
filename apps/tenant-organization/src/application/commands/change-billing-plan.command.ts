import { NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OUTBOX_PUBLISHER, SERVICE_ENTITLEMENT_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ServiceEntitlementRepository } from '../../domain/repositories/service-entitlement.repository';
import { ChangeBillingPlanDto } from '../dto/organization.dto';

export class ChangeBillingPlanCommand {
  constructor(public readonly dto: ChangeBillingPlanDto) {}
}

@CommandHandler(ChangeBillingPlanCommand)
export class ChangeBillingPlanHandler implements ICommandHandler<ChangeBillingPlanCommand, { entitlementId: string }> {
  constructor(
    @Inject(SERVICE_ENTITLEMENT_REPOSITORY) private readonly entitlements: ServiceEntitlementRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ChangeBillingPlanCommand): Promise<{ entitlementId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const entitlement = await this.entitlements.findByTenantId(tenantId);
    if (!entitlement) {
      throw new NotFoundError('Service entitlement not found. Provision default entitlement first.');
    }
    entitlement.changePlan(
      command.dto.planType,
      command.dto.billingCycle,
      Number(command.dto.pricePerSeat),
      { seats: command.dto.seats, apiCallsPerMonth: command.dto.apiCallsPerMonth },
    );
    if (command.dto.nextInvoiceDate) entitlement.setNextInvoiceDate(command.dto.nextInvoiceDate);
    await this.entitlements.save(entitlement);
    await this.outbox.publish(entitlement.pullEvents());
    return { entitlementId: entitlement.id.value };
  }
}
