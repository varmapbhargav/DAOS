import { CapitalCallId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  CAPITAL_CALL_REPOSITORY,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';
import { CapitalCallRepository } from '../../domain/repositories/capital-call.repository';
import { FundCapitalCallDto } from '../dto/distribution.dto';
import { toMoney } from '../money.mapper';

export class FundCapitalCallCommand {
  constructor(
    public readonly capitalCallId: string,
    public readonly dto: FundCapitalCallDto,
  ) {}
}

@CommandHandler(FundCapitalCallCommand)
export class FundCapitalCallHandler
  implements ICommandHandler<FundCapitalCallCommand, { capitalCallId: string; status: string }>
{
  constructor(
    @Inject(CAPITAL_CALL_REPOSITORY) private readonly capitalCalls: CapitalCallRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: FundCapitalCallCommand): Promise<{ capitalCallId: string; status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const call = await this.capitalCalls.findById(tenantId, CapitalCallId.create(command.capitalCallId));
    if (!call) throw new NotFoundError(`Capital call not found: ${command.capitalCallId}`);
    call.recordFunding(toMoney(command.dto.amount));
    await this.capitalCalls.save(call);
    await this.outbox.publish(call.pullEvents());
    return { capitalCallId: call.id.value, status: call.status };
  }
}