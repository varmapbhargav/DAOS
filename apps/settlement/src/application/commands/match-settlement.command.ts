import { CustodianBankPort, NotFoundError, OutboxPublisher, SettlementInstructionId, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  CUSTODIAN_BANK,
  OUTBOX_PUBLISHER,
  SETTLEMENT_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { SettlementInstructionRepository } from '../../domain/repositories/settlement-instruction.repository';

export class MatchSettlementCommand {
  constructor(public readonly instructionId: string) {}
}

@CommandHandler(MatchSettlementCommand)
export class MatchSettlementHandler
  implements ICommandHandler<MatchSettlementCommand, { instructionId: string; status: string }>
{
  constructor(
    @Inject(SETTLEMENT_REPOSITORY) private readonly settlements: SettlementInstructionRepository,
    @Inject(CUSTODIAN_BANK) private readonly custodian: CustodianBankPort,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: MatchSettlementCommand): Promise<{ instructionId: string; status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const instruction = await this.settlements.findById(tenantId, SettlementInstructionId.create(command.instructionId));
    if (!instruction) throw new NotFoundError(`Settlement instruction not found: ${command.instructionId}`);
    instruction.match();
    await this.custodian.confirmSettlement(instruction.tradeReference);
    await this.settlements.save(instruction);
    await this.outbox.publish(instruction.pullEvents());
    return { instructionId: instruction.id.value, status: instruction.status };
  }
}
