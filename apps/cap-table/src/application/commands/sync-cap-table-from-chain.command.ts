import { CapTableId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CAP_TABLE_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { CapTableRepository } from '../../domain/repositories/cap-table.repository';
import { SyncCapTableDto } from '../dto/cap-table.dto';

export class SyncCapTableFromChainCommand {
  constructor(
    public readonly capTableId: string,
    public readonly dto: SyncCapTableDto,
  ) {}
}

@CommandHandler(SyncCapTableFromChainCommand)
export class SyncCapTableFromChainHandler
  implements ICommandHandler<SyncCapTableFromChainCommand, { capTableId: string; blockNumber: string }>
{
  constructor(
    @Inject(CAP_TABLE_REPOSITORY) private readonly capTables: CapTableRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: SyncCapTableFromChainCommand): Promise<{ capTableId: string; blockNumber: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const capTable = await this.capTables.findById(tenantId, CapTableId.create(command.capTableId));
    if (!capTable) throw new NotFoundError(`Cap table not found: ${command.capTableId}`);
    capTable.syncFromChain({
      totalIssuedUnits: BigInt(command.dto.totalIssuedUnits),
      blockNumber: command.dto.blockNumber,
      shareholders: command.dto.shareholders.map((s) => ({
        shareholderId: s.shareholderId,
        name: s.name,
        walletAddress: s.walletAddress,
        shareClassId: s.shareClassId,
        units: BigInt(s.units),
      })),
    });
    await this.capTables.save(capTable);
    await this.outbox.publish(capTable.pullEvents());
    return { capTableId: capTable.id.value, blockNumber: command.dto.blockNumber };
  }
}