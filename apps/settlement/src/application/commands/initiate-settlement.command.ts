import { CustodianBankPort, Money, OutboxPublisher, SettlementLeg, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SettlementInstruction } from '../../domain/aggregates/settlement-instruction.aggregate';
import {
  CUSTODIAN_BANK,
  OUTBOX_PUBLISHER,
  SETTLEMENT_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { SettlementInstructionRepository } from '../../domain/repositories/settlement-instruction.repository';
import { InitiateSettlementDto } from '../dto/settlement.dto';
import { toMoney } from '../money.mapper';

export class InitiateSettlementCommand {
  constructor(public readonly dto: InitiateSettlementDto) {}
}

@CommandHandler(InitiateSettlementCommand)
export class InitiateSettlementHandler
  implements ICommandHandler<InitiateSettlementCommand, { instructionId: string }>
{
  constructor(
    @Inject(SETTLEMENT_REPOSITORY) private readonly settlements: SettlementInstructionRepository,
    @Inject(CUSTODIAN_BANK) private readonly custodian: CustodianBankPort,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: InitiateSettlementCommand): Promise<{ instructionId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const legs: SettlementLeg[] = command.dto.legs.map((leg) => ({
      party: leg.party as SettlementLeg['party'],
      securityId: leg.securityId,
      quantity: BigInt(leg.quantity),
      amount: toMoney(leg.amount),
      settlementDate: leg.settlementDate,
    }));
    const instruction = SettlementInstruction.initiate({
      tenantId,
      tradeReference: command.dto.tradeReference,
      settlementType: command.dto.settlementType as SettlementInstruction['settlementType'],
      cycle: command.dto.cycle as SettlementInstruction['cycle'],
      settlementDate: command.dto.settlementDate,
      securityId: command.dto.securityId,
      quantity: BigInt(command.dto.quantity),
      amount: toMoney(command.dto.amount),
      legs,
    });

    await this.custodian.acknowledgeSettlement(command.dto.tradeReference, command.dto.settlementDate);
    await this.settlements.save(instruction);
    await this.outbox.publish(instruction.pullEvents());
    return { instructionId: instruction.id.value };
  }
}
