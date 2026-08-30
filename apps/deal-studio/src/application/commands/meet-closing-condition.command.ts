import {
  NotFoundError,
  OutboxPublisher,
  TenantContextHolder,
  TenantId,
} from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DealId } from '@daos/shared-kernel';

import {
  DEAL_REPOSITORY,
  OUTBOX_PUBLISHER,
  TERM_SHEET_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { TermSheetRepository } from '../../domain/repositories/term-sheet.repository';
import { MeetClosingConditionDto } from '../dto/deal-action.dto';

export class MeetClosingConditionCommand {
  constructor(
    public readonly dealId: string,
    public readonly dto: MeetClosingConditionDto,
  ) {}
}

@CommandHandler(MeetClosingConditionCommand)
export class MeetClosingConditionHandler
  implements ICommandHandler<MeetClosingConditionCommand, { met: boolean }>
{
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly deals: DealRepository,
    @Inject(TERM_SHEET_REPOSITORY) private readonly termSheets: TermSheetRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: MeetClosingConditionCommand): Promise<{ met: boolean }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, DealId.create(command.dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${command.dealId}`);

    const description = command.dto.description;
    deal.meetClosingCondition(description);

    const termSheet = await this.termSheets.findByDealId(tenantId, deal.id.value);
    if (termSheet) {
      try {
        termSheet.markConditionMet(description);
        await this.termSheets.save(termSheet);
      } catch {
        // closing condition may not be present on the term sheet yet
      }
    }

    await this.deals.save(deal);
    await this.outbox.publish(deal.pullEvents());
    return { met: true };
  }
}
