import { OutboxPublisher, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OUTBOX_PUBLISHER, SERVICE_ENTITLEMENT_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ServiceEntitlementRepository } from '../../domain/repositories/service-entitlement.repository';

export class CancelSubscriptionCommand {}

@CommandHandler(CancelSubscriptionCommand)
export class CancelSubscriptionHandler implements ICommandHandler<CancelSubscriptionCommand, { entitlementId: string }> {
  constructor(
    @Inject(SERVICE_ENTITLEMENT_REPOSITORY) private readonly entitlements: ServiceEntitlementRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(): Promise<{ entitlementId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const entitlement = await this.entitlements.findByTenantId(tenantId);
    if (!entitlement) {
      throw new NotFoundError('Service entitlement not found. Provision default entitlement first.');
    }
    entitlement.cancel();
    await this.entitlements.save(entitlement);
    await this.outbox.publish(entitlement.pullEvents());
    return { entitlementId: entitlement.id.value };
  }
}
