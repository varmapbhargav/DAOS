import { DomainMetadata, DealId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Deal } from '../../domain/aggregates/deal.aggregate';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { DEAL_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';

export class PutOnHoldCommand {
  constructor(public readonly dealId: string, public readonly actorId: string, public readonly holdReason: string) {}
}

@CommandHandler(PutOnHoldCommand)
export class PutOnHoldHandler implements ICommandHandler<PutOnHoldCommand, void> {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly deals: DealRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: PutOnHoldCommand): Promise<void> {
    const { dealId, actorId, holdReason } = command;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, DealId.create(dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${dealId}`);

    deal.putOnHold(actorId, holdReason);
    await this.deals.save(deal);
    await this.outbox.publish(deal.pullEvents());
  }
}