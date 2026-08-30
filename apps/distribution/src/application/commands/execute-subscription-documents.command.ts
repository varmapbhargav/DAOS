import { NotFoundError, OutboxPublisher, SubscriptionId, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OUTBOX_PUBLISHER, SUBSCRIPTION_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';

export class ExecuteSubscriptionDocumentsCommand {
  constructor(public readonly subscriptionId: string) {}
}

@CommandHandler(ExecuteSubscriptionDocumentsCommand)
export class ExecuteSubscriptionDocumentsHandler
  implements ICommandHandler<ExecuteSubscriptionDocumentsCommand, { subscriptionId: string; status: string }>
{
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptions: SubscriptionRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ExecuteSubscriptionDocumentsCommand): Promise<{ subscriptionId: string; status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const subscription = await this.subscriptions.findById(tenantId, SubscriptionId.create(command.subscriptionId));
    if (!subscription) throw new NotFoundError(`Subscription not found: ${command.subscriptionId}`);
    subscription.executeDocuments();
    await this.subscriptions.save(subscription);
    await this.outbox.publish(subscription.pullEvents());
    return { subscriptionId: subscription.id.value, status: subscription.status };
  }
}