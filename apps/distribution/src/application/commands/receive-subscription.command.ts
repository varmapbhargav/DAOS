import { OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Subscription } from '../../domain/aggregates/subscription.aggregate';
import { OUTBOX_PUBLISHER, SUBSCRIPTION_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';
import { ReceiveSubscriptionDto } from '../dto/distribution.dto';
import { toMoney } from '../money.mapper';

export class ReceiveSubscriptionCommand {
  constructor(public readonly dto: ReceiveSubscriptionDto) {}
}

@CommandHandler(ReceiveSubscriptionCommand)
export class ReceiveSubscriptionHandler
  implements ICommandHandler<ReceiveSubscriptionCommand, { subscriptionId: string }>
{
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptions: SubscriptionRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ReceiveSubscriptionCommand): Promise<{ subscriptionId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const subscription = Subscription.receive({
      tenantId,
      productId: command.dto.productId,
      investorId: command.dto.investorId,
      requestedAmount: toMoney(command.dto.requestedAmount),
    });
    await this.subscriptions.save(subscription);
    await this.outbox.publish(subscription.pullEvents());
    return { subscriptionId: subscription.id.value };
  }
}