import { CorporateActionId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CORPORATE_ACTION_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { CorporateActionRepository } from '../../domain/repositories/corporate-action.repository';
import { CloseElectionDto } from '../dto/waterfall.dto';

export class CloseElectionCommand {
  constructor(
    public readonly corporateActionId: string,
    public readonly dto: CloseElectionDto,
  ) {}
}

@CommandHandler(CloseElectionCommand)
export class CloseElectionHandler implements ICommandHandler<CloseElectionCommand, { corporateActionId: string }> {
  constructor(
    @Inject(CORPORATE_ACTION_REPOSITORY) private readonly actions: CorporateActionRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CloseElectionCommand): Promise<{ corporateActionId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const action = await this.actions.findById(tenantId, CorporateActionId.create(command.corporateActionId));
    if (!action) throw new NotFoundError(`Corporate action not found: ${command.corporateActionId}`);
    action.openElection();
    action.closeElection(command.dto.elections);

    await this.actions.save(action);
    await this.outbox.publish(action.pullEvents());
    return { corporateActionId: action.id.value };
  }
}
