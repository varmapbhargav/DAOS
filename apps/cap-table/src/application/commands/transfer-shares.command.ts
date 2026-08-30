import { CapTableId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CAP_TABLE_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { CapTableRepository } from '../../domain/repositories/cap-table.repository';
import { TransferSharesDto } from '../dto/cap-table.dto';

export class TransferSharesCommand {
  constructor(
    public readonly capTableId: string,
    public readonly dto: TransferSharesDto,
  ) {}
}

@CommandHandler(TransferSharesCommand)
export class TransferSharesHandler implements ICommandHandler<TransferSharesCommand, { transferId: string; units: string }> {
  constructor(
    @Inject(CAP_TABLE_REPOSITORY) private readonly capTables: CapTableRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: TransferSharesCommand): Promise<{ transferId: string; units: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const capTable = await this.capTables.findById(tenantId, CapTableId.create(command.capTableId));
    if (!capTable) throw new NotFoundError(`Cap table not found: ${command.capTableId}`);
    const transfer = capTable.transferShares({
      fromShareholderId: command.dto.fromShareholderId,
      toShareholderId: command.dto.toShareholderId,
      shareClassId: command.dto.shareClassId,
      units: BigInt(command.dto.units),
      transferType: command.dto.transferType,
    });
    await this.capTables.save(capTable);
    await this.outbox.publish(capTable.pullEvents());
    return { transferId: transfer.id, units: transfer.units.toString() };
  }
}