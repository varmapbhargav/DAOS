import {
  NotFoundError,
  OutboxPublisher,
  PaymentGatewayPort,
  SubscriptionId,
  TenantContextHolder,
  TenantId,
} from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';

import {
  OUTBOX_PUBLISHER,
  PAYMENT_GATEWAY,
  SUBSCRIPTION_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';

export class FundSubscriptionCommand {
  constructor(public readonly subscriptionId: string) {}
}

@CommandHandler(FundSubscriptionCommand)
export class FundSubscriptionHandler
  implements ICommandHandler<FundSubscriptionCommand, { subscriptionId: string; status: string; paymentRef: string }>
{
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptions: SubscriptionRepository,
    @Inject(PAYMENT_GATEWAY) private readonly payments: PaymentGatewayPort,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: FundSubscriptionCommand): Promise<{ subscriptionId: string; status: string; paymentRef: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const subscription = await this.subscriptions.findById(tenantId, SubscriptionId.create(command.subscriptionId));
    if (!subscription) throw new NotFoundError(`Subscription not found: ${command.subscriptionId}`);
    if (!subscription.allocatedAmount) throw new Error('Subscription has no allocation to fund');
    const reference = `SUB-${randomUUID()}`;
    const payment = await this.payments.initiatePayment(subscription.investorId, subscription.allocatedAmount, reference);
    subscription.fund(payment.paymentRef);
    await this.subscriptions.save(subscription);
    await this.outbox.publish(subscription.pullEvents());
    return { subscriptionId: subscription.id.value, status: subscription.status, paymentRef: payment.paymentRef };
  }
}