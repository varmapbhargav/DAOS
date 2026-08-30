import { BillingProviderPort, NotFoundError, OutboxPublisher, PaymentMethod, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  BILLING_PROVIDER_PORT,
  OUTBOX_PUBLISHER,
  SERVICE_ENTITLEMENT_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { ServiceEntitlementRepository } from '../../domain/repositories/service-entitlement.repository';
import { AddPaymentMethodDto } from '../dto/organization.dto';

export class AddPaymentMethodCommand {
  constructor(public readonly dto: AddPaymentMethodDto) {}
}

@CommandHandler(AddPaymentMethodCommand)
export class AddPaymentMethodHandler implements ICommandHandler<AddPaymentMethodCommand, { entitlementId: string }> {
  constructor(
    @Inject(SERVICE_ENTITLEMENT_REPOSITORY) private readonly entitlements: ServiceEntitlementRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
    @Inject(BILLING_PROVIDER_PORT) private readonly billing: BillingProviderPort,
  ) {}

  async execute(command: AddPaymentMethodCommand): Promise<{ entitlementId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const entitlement = await this.entitlements.findByTenantId(tenantId);
    if (!entitlement) {
      throw new NotFoundError('Service entitlement not found. Provision default entitlement first.');
    }
    const tokenized = await this.billing.createPaymentMethod(command.dto.token);
    const method: PaymentMethod = {
      type: command.dto.type,
      last4: tokenized.last4,
      expiry: tokenized.expiry,
      status: 'valid',
    };
    entitlement.addPaymentMethod(method);
    await this.entitlements.save(entitlement);
    await this.outbox.publish(entitlement.pullEvents());
    return { entitlementId: entitlement.id.value };
  }
}
