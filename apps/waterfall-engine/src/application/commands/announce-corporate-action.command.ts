import { OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CorporateAction } from '../../domain/aggregates/corporate-action.aggregate';
import { CORPORATE_ACTION_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { CorporateActionRepository } from '../../domain/repositories/corporate-action.repository';
import { AnnounceCorporateActionDto } from '../dto/waterfall.dto';

export class AnnounceCorporateActionCommand {
  constructor(public readonly dto: AnnounceCorporateActionDto) {}
}

@CommandHandler(AnnounceCorporateActionCommand)
export class AnnounceCorporateActionHandler
  implements ICommandHandler<AnnounceCorporateActionCommand, { corporateActionId: string }>
{
  constructor(
    @Inject(CORPORATE_ACTION_REPOSITORY) private readonly actions: CorporateActionRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: AnnounceCorporateActionCommand): Promise<{ corporateActionId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const action = CorporateAction.announce({
      tenantId,
      issuanceId: command.dto.issuanceId,
      type: command.dto.type as CorporateAction['type'],
      exDate: command.dto.exDate,
      recordDate: command.dto.recordDate,
      paymentDate: command.dto.paymentDate,
      options: command.dto.options,
    });
    await this.actions.save(action);
    await this.outbox.publish(action.pullEvents());
    return { corporateActionId: action.id.value };
  }
}
