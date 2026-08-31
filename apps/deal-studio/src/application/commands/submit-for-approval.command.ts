import { DomainMetadata, DealId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Deal } from '../../domain/aggregates/deal.aggregate';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { DEAL_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';

export class SubmitForApprovalCommand {
  constructor(public readonly dealId: string, public readonly actorId: string, public readonly workflowId: string, public readonly reason?: string) {}
}

@CommandHandler(SubmitForApprovalCommand)
export class SubmitForApprovalHandler implements ICommandHandler<SubmitForApprovalCommand, void> {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly deals: DealRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: SubmitForApprovalCommand): Promise<void> {
    const { dealId, actorId, workflowId, reason } = command;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, DealId.create(dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${dealId}`);

    deal.submitForApproval(actorId, workflowId, reason ?? 'Submitted for investment committee approval');
    await this.deals.save(deal);
    await this.outbox.publish(deal.pullEvents());
  }
}