import {
  NotFoundError,
  OutboxPublisher,
  TenantContextHolder,
  TenantId,
  DealRole,
  hasPermission,
} from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DealId } from '@daos/shared-kernel';

import { DEAL_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { CloseDealDto } from '../dto/deal-action.dto';

export class CloseDealCommand {
  constructor(
    public readonly dealId: string,
    public readonly dto: CloseDealDto,
  ) {}
}

@CommandHandler(CloseDealCommand)
export class CloseDealHandler implements ICommandHandler<CloseDealCommand, { status: string }> {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly deals: DealRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CloseDealCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actorId = TenantContextHolder.get().userId ?? 'system';
    const roleIds = TenantContextHolder.get().roleIds;

    // Validate closer permission
    if (!hasPermission(roleIds, 'close:deal')) {
      throw new Error(`User with roles ${roleIds.join(', ')} does not have permission to close deals`);
    }

    const deal = await this.deals.findById(tenantId, DealId.create(command.dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${command.dealId}`);

    deal.close(actorId);
    await this.deals.save(deal);
    await this.outbox.publish(deal.pullEvents());
    return { status: deal.status };
  }
}
