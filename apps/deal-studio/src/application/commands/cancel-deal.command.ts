import {
  NotFoundError,
  OutboxPublisher,
  TenantContextHolder,
  TenantId,
} from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DealId } from '@daos/shared-kernel';

import { DEAL_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { CancelDealDto } from '../dto/deal-action.dto';

export class CancelDealCommand {
  constructor(
    public readonly dealId: string,
    public readonly dto: CancelDealDto,
  ) {}
}

@CommandHandler(CancelDealCommand)
export class CancelDealHandler implements ICommandHandler<CancelDealCommand, { status: string }> {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly deals: DealRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CancelDealCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, DealId.create(command.dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${command.dealId}`);

    deal.cancel(command.dto.reason);
    await this.deals.save(deal);
    await this.outbox.publish(deal.pullEvents());
    return { status: deal.status };
  }
}
