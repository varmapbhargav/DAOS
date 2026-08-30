import { CapTableId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ShareholderRecord } from '../../domain/entities/shareholder-record.entity';
import { CAP_TABLE_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { CapTableRepository } from '../../domain/repositories/cap-table.repository';
import { AddShareholderDto } from '../dto/cap-table.dto';

export class AddShareholderCommand {
  constructor(
    public readonly capTableId: string,
    public readonly dto: AddShareholderDto,
  ) {}
}

@CommandHandler(AddShareholderCommand)
export class AddShareholderHandler
  implements ICommandHandler<AddShareholderCommand, { shareholderRecordId: string }>
{
  constructor(
    @Inject(CAP_TABLE_REPOSITORY) private readonly capTables: CapTableRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: AddShareholderCommand): Promise<{ shareholderRecordId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const capTable = await this.capTables.findById(tenantId, CapTableId.create(command.capTableId));
    if (!capTable) throw new NotFoundError(`Cap table not found: ${command.capTableId}`);
    const record = ShareholderRecord.create({
      shareholderId: command.dto.shareholderId,
      name: command.dto.name,
      shareholderType: command.dto.shareholderType,
      walletAddress: command.dto.walletAddress ?? null,
      shareClassId: command.dto.shareClassId,
      unitsHeld: BigInt(command.dto.unitsHeld),
    });
    capTable.addShareholder(record);
    await this.capTables.save(capTable);
    await this.outbox.publish(capTable.pullEvents());
    return { shareholderRecordId: record.id.value };
  }
}