import { BlockchainSettlementPort, NotFoundError, OutboxPublisher, SettlementInstructionId, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  BLOCKCHAIN_SETTLEMENT,
  OUTBOX_PUBLISHER,
  SETTLEMENT_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { SettlementInstructionRepository } from '../../domain/repositories/settlement-instruction.repository';

export class ConfirmSettlementCommand {
  constructor(public readonly instructionId: string) {}
}

@CommandHandler(ConfirmSettlementCommand)
export class ConfirmSettlementHandler
  implements ICommandHandler<ConfirmSettlementCommand, { instructionId: string; status: string }>
{
  constructor(
    @Inject(SETTLEMENT_REPOSITORY) private readonly settlements: SettlementInstructionRepository,
    @Inject(BLOCKCHAIN_SETTLEMENT) private readonly blockchain: BlockchainSettlementPort,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ConfirmSettlementCommand): Promise<{ instructionId: string; status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const instruction = await this.settlements.findById(tenantId, SettlementInstructionId.create(command.instructionId));
    if (!instruction) throw new NotFoundError(`Settlement instruction not found: ${command.instructionId}`);

    await this.blockchain.settleTrade(
      instruction.tradeReference,
      'escrow-buyer',
      'escrow-seller',
      instruction.quantity,
    );
    instruction.confirmSettlement();
    await this.settlements.save(instruction);
    await this.outbox.publish(instruction.pullEvents());
    return { instructionId: instruction.id.value, status: instruction.status };
  }
}
