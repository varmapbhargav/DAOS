import { ClosingId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CLOSING_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { ClosingRepository } from '../../domain/repositories/closing.repository';

export class CompleteClosingCommand {
  constructor(public readonly closingId: string) {}
}

@CommandHandler(CompleteClosingCommand)
export class CompleteClosingHandler
  implements ICommandHandler<CompleteClosingCommand, { closingId: string; status: string }>
{
  constructor(
    @Inject(CLOSING_REPOSITORY) private readonly closings: ClosingRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CompleteClosingCommand): Promise<{ closingId: string; status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const closing = await this.closings.findById(tenantId, ClosingId.create(command.closingId));
    if (!closing) throw new NotFoundError(`Closing not found: ${command.closingId}`);
    closing.hardClose();
    await this.closings.save(closing);
    await this.outbox.publish(closing.pullEvents());
    return { closingId: closing.id.value, status: closing.status };
  }
}