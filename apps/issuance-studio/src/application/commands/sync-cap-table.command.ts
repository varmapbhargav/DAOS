import { IssuanceId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ISSUANCE_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { IssuanceRepository } from '../../domain/repositories/issuance.repository';

export class SyncCapTableCommand {
  constructor(
    public readonly issuanceId: string,
    public readonly capTableId: string,
  ) {}
}

@CommandHandler(SyncCapTableCommand)
export class SyncCapTableHandler implements ICommandHandler<SyncCapTableCommand, { status: string }> {
  constructor(
    @Inject(ISSUANCE_REPOSITORY) private readonly issuances: IssuanceRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: SyncCapTableCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const issuance = await this.issuances.findById(tenantId, IssuanceId.create(command.issuanceId));
    if (!issuance) throw new NotFoundError(`Issuance not found: ${command.issuanceId}`);

    issuance.syncCapTable(command.capTableId);
    await this.issuances.save(issuance);
    await this.outbox.publish(issuance.pullEvents());
    return { status: issuance.status };
  }
}