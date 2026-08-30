import { DomainMetadata, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Deal } from '../../domain/aggregates/deal.aggregate';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { DEAL_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';

export class CloseConditionsVerifyCommand {
  constructor(public readonly dealId: string, public readonly conditionId: string, public readonly verifiedBy: string, public readonly evidenceRef?: string) {}
}

@CommandHandler(CloseConditionsVerifyCommand)
export class CloseConditionsVerifyHandler implements ICommandHandler<CloseConditionsVerifyCommand, void> {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly deals: DealRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CloseConditionsVerifyCommand): Promise<void> {
    const { dealId, conditionId, verifiedBy, evidenceRef } = command;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, dealId);
    if (!deal) throw new NotFoundError(`Deal not found: ${dealId}`);

    deal.verifyClosingCondition(conditionId, verifiedBy, evidenceRef);
    await this.deals.save(deal);
    await this.outbox.publish(deal.pullEvents());
  }
}