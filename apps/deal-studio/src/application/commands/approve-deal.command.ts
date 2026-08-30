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

import {
  CLOSING_CONDITION_CHECKER,
  DEAL_REPOSITORY,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { ClosingConditionChecker } from '../../domain/services/closing-condition-checker';
import { ApproveDealDto } from '../dto/deal-action.dto';

export class ApproveDealCommand {
  constructor(
    public readonly dealId: string,
    public readonly dto: ApproveDealDto,
  ) {}
}

@CommandHandler(ApproveDealCommand)
export class ApproveDealHandler implements ICommandHandler<ApproveDealCommand, { status: string }> {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly deals: DealRepository,
    @Inject(CLOSING_CONDITION_CHECKER) private readonly checker: ClosingConditionChecker,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ApproveDealCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actorId = TenantContextHolder.get().userId ?? 'system';
    const roleIds = TenantContextHolder.get().roleIds;

    // Validate approver permission
    if (!hasPermission(roleIds, 'approve:deal')) {
      throw new Error(`User with roles ${roleIds.join(', ')} does not have permission to approve deals`);
    }

    const deal = await this.deals.findById(tenantId, DealId.create(command.dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${command.dealId}`);

    deal.approve(actorId, this.checker);
    await this.deals.save(deal);
    await this.outbox.publish(deal.pullEvents());
    return { status: deal.status };
  }
}
