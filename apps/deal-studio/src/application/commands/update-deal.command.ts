import { DealMetadata, DealId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Deal } from '../../domain/aggregates/deal.aggregate';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { DEAL_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { UpdateDealDto } from '../dto/update-deal.dto';

export class UpdateDealCommand {
  constructor(public readonly dealId: string, public readonly dto: UpdateDealDto) {}
}

@CommandHandler(UpdateDealCommand)
export class UpdateDealHandler implements ICommandHandler<UpdateDealCommand, void> {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly deals: DealRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: UpdateDealCommand): Promise<void> {
    const { dealId, dto } = command;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, DealId.create(dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${dealId}`);

    if (dto.name !== undefined) deal.rename(dto.name);
    if (dto.metadata !== undefined) deal.updateMetadata(dto.metadata as unknown as DealMetadata);
    if (dto.economics !== undefined) deal.updateEconomics(dto.economics as any);

    await this.deals.save(deal);
    await this.outbox.publish(deal.pullEvents());
  }
}