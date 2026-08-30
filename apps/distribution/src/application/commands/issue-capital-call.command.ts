import { CapitalCallId, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CapitalCall } from '../../domain/aggregates/capital-call.aggregate';
import {
  CAPITAL_CALL_REPOSITORY,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';
import { CapitalCallRepository } from '../../domain/repositories/capital-call.repository';
import { IssueCapitalCallDto } from '../dto/distribution.dto';
import { toMoney } from '../money.mapper';

export class IssueCapitalCallCommand {
  constructor(public readonly dto: IssueCapitalCallDto) {}
}

@CommandHandler(IssueCapitalCallCommand)
export class IssueCapitalCallHandler
  implements ICommandHandler<IssueCapitalCallCommand, { capitalCallId: string }>
{
  constructor(
    @Inject(CAPITAL_CALL_REPOSITORY) private readonly capitalCalls: CapitalCallRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: IssueCapitalCallCommand): Promise<{ capitalCallId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const call = CapitalCall.issue({
      tenantId,
      closingId: command.dto.closingId,
      investorId: command.dto.investorId,
      amount: toMoney(command.dto.amount),
      dueDate: command.dto.dueDate,
    });
    await this.capitalCalls.save(call);
    await this.outbox.publish(call.pullEvents());
    return { capitalCallId: call.id.value };
  }
}