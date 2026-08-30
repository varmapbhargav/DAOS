import { CustodianBankPort, NotFoundError, OutboxPublisher, SettlementInstructionId, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  CUSTODIAN_BANK,
  OUTBOX_PUBLISHER,
  SETTLEMENT_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { SettlementInstructionRepository } from '../../domain/repositories/settlement-instruction.repository';
import { FailSettlementDto } from '../dto/settlement.dto';

export class FailSettlementCommand {
  constructor(
    public readonly instructionId: string,
    public readonly dto: FailSettlementDto,
  ) {}
}

@CommandHandler(FailSettlementCommand)
export class FailSettlementHandler implements ICommandHandler<FailSettlementCommand, { instructionId: string; status: string }> {
  constructor(
    @Inject(SETTLEMENT_REPOSITORY) private readonly settlements: SettlementInstructionRepository,
    @Inject(CUSTODIAN_BANK) private readonly custodian: CustodianBankPort,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: FailSettlementCommand): Promise<{ instructionId: string; status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const instruction = await this.settlements.findById(tenantId, SettlementInstructionId.create(command.instructionId));
    if (!instruction) throw new NotFoundError(`Settlement instruction not found: ${command.instructionId}`);
    instruction.fail(command.dto.reason);
    await this.custodian.failSettlement(instruction.tradeReference, command.dto.reason);
    await this.settlements.save(instruction);
    await this.outbox.publish(instruction.pullEvents());
    return { instructionId: instruction.id.value, status: instruction.status };
  }
}
