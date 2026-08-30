import { NotFoundError, OutboxPublisher, SubscriptionId, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Subscription } from '../../domain/aggregates/subscription.aggregate';
import { Allocation } from '../../domain/aggregates/allocation.aggregate';
import { AllocationEngine } from '../../domain/services/allocation-engine';
import {
  ALLOCATION_REPOSITORY,
  OUTBOX_PUBLISHER,
  SUBSCRIPTION_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { AllocationRepository } from '../../domain/repositories/allocation.repository';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';
import { AllocateSubscriptionsDto } from '../dto/distribution.dto';
import { toMoney } from '../money.mapper';

export class AllocateSubscriptionsCommand {
  constructor(public readonly dto: AllocateSubscriptionsDto) {}
}

export interface AllocateSubscriptionsResult {
  allocationId: string;
  entryCount: number;
}

@CommandHandler(AllocateSubscriptionsCommand)
export class AllocateSubscriptionsHandler
  implements ICommandHandler<AllocateSubscriptionsCommand, AllocateSubscriptionsResult>
{
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptions: SubscriptionRepository,
    @Inject(ALLOCATION_REPOSITORY) private readonly allocations: AllocationRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
    private readonly engine: AllocationEngine,
  ) {}

  async execute(command: AllocateSubscriptionsCommand): Promise<AllocateSubscriptionsResult> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const all = await this.subscriptions.findByProductId(tenantId, command.dto.productId);
    const eligible = all.filter((s) => s.status === 'documentsExecuted' || s.status === 'draft');
    const totalAmount = toMoney(command.dto.totalAmount);
    const entries = this.engine.allocate({
      method: command.dto.method,
      totalAmount,
      subscriptions: eligible,
    });

    const allocation = Allocation.create({
      tenantId,
      closingId: command.dto.closingId,
      productId: command.dto.productId,
      method: command.dto.method,
      totalAmount,
    });
    allocation.setEntries(entries);
    allocation.finalize();
    allocation.publish();

    await Promise.all(
      entries.map(async (entry) => {
        const subscription = await this.subscriptions.findById(tenantId, SubscriptionId.create(entry.subscriptionId));
        if (!subscription) throw new NotFoundError(`Subscription not found: ${entry.subscriptionId}`);
        subscription.approveAllocation(entry.allocatedAmount, entry.allocationPct);
        await this.subscriptions.save(subscription);
        await this.outbox.publish(subscription.pullEvents());
      }),
    );

    await this.allocations.save(allocation);
    await this.outbox.publish(allocation.pullEvents());
    return { allocationId: allocation.id.value, entryCount: entries.length };
  }
}