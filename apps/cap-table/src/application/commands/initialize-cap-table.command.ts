import { OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CapTable } from '../../domain/aggregates/cap-table.aggregate';
import { CAP_TABLE_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { CapTableRepository } from '../../domain/repositories/cap-table.repository';
import { InitializeCapTableDto } from '../dto/cap-table.dto';

export class InitializeCapTableCommand {
  constructor(public readonly dto: InitializeCapTableDto) {}
}

@CommandHandler(InitializeCapTableCommand)
export class InitializeCapTableHandler
  implements ICommandHandler<InitializeCapTableCommand, { capTableId: string }>
{
  constructor(
    @Inject(CAP_TABLE_REPOSITORY) private readonly capTables: CapTableRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: InitializeCapTableCommand): Promise<{ capTableId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const capTable = CapTable.initialize({
      tenantId,
      issuanceId: command.dto.issuanceId ?? null,
      shareClassId: command.dto.shareClassId,
    });
    await this.capTables.save(capTable);
    await this.outbox.publish(capTable.pullEvents());
    return { capTableId: capTable.id.value };
  }
}