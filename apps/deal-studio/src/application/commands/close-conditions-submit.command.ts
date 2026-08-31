import { DomainMetadata, DealId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Deal } from '../../domain/aggregates/deal.aggregate';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { DEAL_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';

export class CloseConditionsSubmitCommand {
  constructor(public readonly dealId: string, public readonly conditionId: string, public readonly actorId: string, public readonly evidenceRef?: string) {}
}

@CommandHandler(CloseConditionsSubmitCommand)
export class CloseConditionsSubmitHandler implements ICommandHandler<CloseConditionsSubmitCommand, void> {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly deals: DealRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CloseConditionsSubmitCommand): Promise<void> {
    const { dealId, conditionId, actorId, evidenceRef } = command;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, DealId.create(dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${dealId}`);

    deal.meetClosingCondition(conditionId);
    await this.deals.save(deal);
    await this.outbox.publish(deal.pullEvents());
  }
}