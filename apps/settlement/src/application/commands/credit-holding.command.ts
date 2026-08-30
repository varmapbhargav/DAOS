import { CustodyAccountId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CUSTODY_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { CustodyAccountRepository } from '../../domain/repositories/custody-account.repository';
import { CreditHoldingDto } from '../dto/settlement.dto';
import { toMoney } from '../money.mapper';

export class CreditHoldingCommand {
  constructor(
    public readonly accountId: string,
    public readonly dto: CreditHoldingDto,
  ) {}
}

@CommandHandler(CreditHoldingCommand)
export class CreditHoldingHandler implements ICommandHandler<CreditHoldingCommand, { accountId: string }> {
  constructor(
    @Inject(CUSTODY_REPOSITORY) private readonly accounts: CustodyAccountRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CreditHoldingCommand): Promise<{ accountId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const account = await this.accounts.findById(tenantId, CustodyAccountId.create(command.accountId));
    if (!account) throw new NotFoundError(`Custody account not found: ${command.accountId}`);
    account.creditHolding({
      securityId: command.dto.securityId,
      quantity: BigInt(command.dto.quantity),
      price: toMoney(command.dto.price),
    });
    await this.accounts.save(account);
    await this.outbox.publish(account.pullEvents());
    return { accountId: account.id.value };
  }
}
