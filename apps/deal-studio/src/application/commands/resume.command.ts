import { DomainMetadata, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Deal } from '../../domain/aggregates/deal.aggregate';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { DEAL_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';

export class ResumeCommand {
  constructor(public readonly dealId: string, public readonly actorId: string, public readonly reason?: string) {}
}

@CommandHandler(ResumeCommand)
export class ResumeHandler implements ICommandHandler<ResumeCommand, void> {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly deals: DealRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ResumeCommand): Promise<void> {
    const { dealId, actorId, reason } = command;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, dealId);
    if (!deal) throw new NotFoundError(`Deal not found: ${dealId}`);

    deal.resume(actorId, reason ?? 'Deal resumed');
    await this.deals.save(deal);
    await this.outbox.publish(deal.pullEvents());
  }
}