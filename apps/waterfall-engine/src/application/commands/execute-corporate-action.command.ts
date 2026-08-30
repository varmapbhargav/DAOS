import { CorporateActionId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CORPORATE_ACTION_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { CorporateActionRepository } from '../../domain/repositories/corporate-action.repository';

export class ExecuteCorporateActionCommand {
  constructor(public readonly corporateActionId: string) {}
}

@CommandHandler(ExecuteCorporateActionCommand)
export class ExecuteCorporateActionHandler
  implements ICommandHandler<ExecuteCorporateActionCommand, { corporateActionId: string }>
{
  constructor(
    @Inject(CORPORATE_ACTION_REPOSITORY) private readonly actions: CorporateActionRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ExecuteCorporateActionCommand): Promise<{ corporateActionId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const action = await this.actions.findById(tenantId, CorporateActionId.create(command.corporateActionId));
    if (!action) throw new NotFoundError(`Corporate action not found: ${command.corporateActionId}`);
    action.execute();
    await this.actions.save(action);
    await this.outbox.publish(action.pullEvents());
    return { corporateActionId: action.id.value };
  }
}
